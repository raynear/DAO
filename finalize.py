#!/home/ubuntu/venv/bin python
import sys
import json
import time
from time import sleep
import pytz
import datetime
import dateutil.parser
import math
import requests

from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

NETWORK = "https://ctz.solidwallet.io"
SCORE = "cx2ec14b928b87ef5c1cbe0b9abda151ff088ba03c"

def governance_call(method, params):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    call = CallBuilder()\
        .to("cx0000000000000000000000000000000000000000")\
        .method(method)\
        .params(params)\
        .build()
    result = icon_service.call(call)
    return result


def json_rpc_call(method, params):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    call = CallBuilder()\
        .to(SCORE)\
        .method(method)\
        .params(params)\
        .build()
    result = icon_service.call(call)
    return result


def find_blockheight_from_datetime(expire_datetime):
    given_date = dateutil.parser.parse(expire_datetime)
    given_timestamp = time.mktime(given_date.timetuple())*1000000
    delegate_start_blockheight = 0
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    result = icon_service.get_block("latest")
#    result_json = json.loads(result)

    _min = delegate_start_blockheight
    _max = result['height']
    findFlag = False
    while not findFlag:
        curr = math.floor((_min+_max)/2)

        if curr == _min or curr == _max:
            findFlag = True

        block_info = icon_service.get_block(curr)
        curr_timestamp = block_info['time_stamp']

        if curr_timestamp < given_timestamp:
            _min = curr
        else:
            _max = curr

    max_block_info = icon_service.get_block(_max)
    max_timestamp = max_block_info['time_stamp']
    min_block_info = icon_service.get_block(_min)
    min_timestamp = min_block_info['time_stamp']

    if given_timestamp < max_timestamp:
        if given_timestamp < min_timestamp:
            return _min - 1
        else:
            return _min
    else:
        return _max


def get_final_delegate_tx(prep_address, address, block_height):
    resp = requests.get("https://tracker.icon.foundation/v3/address/info",
                        {'address': address})
    count = resp.json()['data']['txCount']

    latest_tx = False

    for i in range(1, (count//100)+2):
        resp = requests.get("https://tracker.icon.foundation/v3/address/txList",
                            {'address': address, 'page': i, 'count': 100})

        print("!!!!!!!", prep_address, address, block_height)
        print("!@#", resp)

        if resp.status_code == 200:
            tx_list = resp.json()['data']

            # print("resp_json", resp_json)
            # print("tx_list", tx_list)

            icon_service = IconService(HTTPProvider(NETWORK, 3))

            for a_tx in tx_list:
                # print("a")
                if a_tx['height'] < block_height and a_tx['toAddr'] == "cx0000000000000000000000000000000000000000":
                    # print("b")
                    tx_detail = icon_service.get_transaction(a_tx['txHash'])
                    # print("tx_deta il", tx_detail)
                    if tx_detail['data']['method'] == "setDelegation":
                        # print("c")
                        if latest_tx == False or latest_tx['blockHeight'] < tx_detail['blockHeight']:
                            # 1 번만 나오면 순서대로 동작하는거니 처음껄로 리턴하면 됨
                            # print("!!!!!!!!!!!!!!!!!!!!!!")
                            latest_tx = tx_detail
        if latest_tx:
            return latest_tx


def finalize(proposer, proposal_id):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    proposal_result = json_rpc_call(
        "get_proposal", {"_proposer": proposer, "_proposal_id": proposal_id})
    result_json = json.loads(proposal_result)
    print("Proposal!!!!!!!!!!", result_json)

    final_blockheight = find_blockheight_from_datetime(
        str(result_json['expire_date']))

    resp_vote = json_rpc_call(
        "get_votes", {"_proposer": proposer, "_proposal_id": proposal_id})

    vote_json = json.loads(resp_vote)
    print("getVotes!!!!!!!", resp_vote)
    final_delegate_tx_list = []
    select_list = {}
    for a_vote in vote_json['vote']:
        print("!ASDF!@")
        final_delegate_tx = get_final_delegate_tx(proposer,
                                                  a_vote['voter'], final_blockheight)
        print("final_delegate_tx", final_delegate_tx)
        if final_delegate_tx == False or final_delegate_tx == None:
            continue
        tx_amount = 0
        tx_id = ""
        for delegate in final_delegate_tx['data']['params']['delegations']:
            print("delegate", delegate)
            if delegate['address'] == result_json['address']:
                tx_amount = delegate['value']
                tx_id = final_delegate_tx['txHash']

        print("tx_amount", tx_amount)
        print("td_id", tx_id)
        final_delegate_tx_list.append(
            {"voter": a_vote['voter'], "final_delegate_tx_id": final_delegate_tx['txHash'], "final_delegate_amount": tx_amount})

        if a_vote['selectItem'] in select_list:
            select_list[a_vote['selectItem']] += tx_amount
        else:
            select_list[a_vote['selectItem']] = tx_amount

    print("select_list!!!!!!!!!!!!!!!!!!!!", select_list)
    prep_result = governance_call(
        "getPReps", {"blockHeight": final_blockheight})

    prep_delegate = 0
    for a_prep in prep_result['preps']:
        if a_prep['address'] == result_json['address']:
            prep_delegate = a_prep['delegated']

    print("prep_delegate!!!!!!!!!!!!!!!!", prep_delegate)

    print("\n\n\n")
    print("final_delegate_tx_list", final_delegate_tx_list)

    key = ""
    with open('./key.pw') as f:
        key = f.read().strip()
    wallet = KeyWallet.load("../master.key", key)

    transaction = CallTransactionBuilder()\
        .from_(wallet.get_address())\
        .to(SCORE)\
        .step_limit(300000000)\
        .nid(1)\
        .method("finalize")\
        .params({"_proposer": proposer, "_proposal_id": proposal_id, "_total_delegate": prep_delegate, "_final_data": json.dumps(final_delegate_tx_list)})\
        .build()

    signed_transaction = SignedTransaction(transaction, wallet)
    tx_hash = icon_service.send_transaction(signed_transaction)

    proposal_result = json_rpc_call(
        "get_proposal", {"_proposer": proposer, "_proposal_id": proposal_id})
    result_json = json.loads(proposal_result)

    print("result_json", result_json)


def loop_prep():
    prep_result = governance_call("getPReps", {})
    for i in prep_result['preps']:
        is_prep(i['address'])


def is_prep(address):
    verify_result = json_rpc_call("get_verify_info_by_address", {"_address":address})
    result_json = json.loads(verify_result)
    if result_json['ID'] != "":
        proposer = result_json['ID']
        print("ID", result_json['ID'])
        last_proposal_id = json_rpc_call("get_last_proposal_id", {"_proposer":proposer})
        print("last pid", last_proposal_id)
        for i in range(1, int(last_proposal_id)+1):
            proposal_id = i
            proposal_result = json_rpc_call("get_proposal", {"_proposer":proposer, "_proposal_id":proposal_id})
            proposal_json = json.loads(proposal_result)
            print(proposal_id, proposal_json['status'], proposal_json['expire_date'])

            expire_date = dateutil.parser.parse(proposal_json['expire_date'])
            if expire_date<datetime.datetime.now(pytz.UTC) and proposal_json['status']=="Voting":
                print("Start Finalize!!!")

                finalize(proposer, proposal_id)
 

def main():
    loop_prep()
    # finalize(proposer, proposal_id)

if __name__ == '__main__':
    main()
