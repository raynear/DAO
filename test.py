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

NETWORK = "https://bicon.net.solidwallet.io"
SCORE = "cxfacbe52bac0caf7063a0390b102de6b524d1e18b"

TRACKER = "https://tracker.icon.foundation/v3/"

def get_tx_list(address, count):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    _count = count
    i=0
    raw_tx = []
    while _count > 0:
        if _count > 0:
            _count-=100
            i+=1
            response = requests.get(TRACKER+"address/txList?address="+address+"&page="+str(i)+"&count=100")
            result = json.loads(response.text)
            raw_tx.extend(result['data'])

    tx_list = []
    for i in range(len(raw_tx)):
        response = requests.get(TRACKER+"transaction/txDetail?txHash="+raw_tx[i]['txHash'])
        txDetail = json.loads(response.text)
        txData = json.loads(txDetail['data']['dataString'])
        tx_list.append(txData)
    tx_list.reverse()

    verify_list = []
    for i in range(len(tx_list)):
        a_tx = tx_list[i]
        if 'method' in a_tx and a_tx['method'] == 'verify':
            verify_list.append(a_tx['params']['_id'])

    single_verify_list = []
    for i in range(len(verify_list)):
        flag = False
        for j in range(len(single_verify_list)):
            if verify_list[i] == single_verify_list[j]:
                flag = True
        if flag==False:
            single_verify_list.append(verify_list[i])

    print(single_verify_list)
    print(len(single_verify_list))


    key = ""
    with open('./key.pw') as f:
        key = f.read().strip()
    wallet = KeyWallet.load("../master.key", key)

    transaction = CallTransactionBuilder()\
        .from_(wallet.get_address())\
        .to(SCORE)\
        .step_limit(300000000)\
        .nid(1)\
        .method("input_verify_count")\
        .params({"_verify_list": json.dumps(single_verify_list)})\
        .build()

    signed_transaction = SignedTransaction(transaction, wallet)
    tx_hash = icon_service.send_transaction(signed_transaction)

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


def set_timestamp(proposer, proposal_id):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    proposal_result = json_rpc_call(
        "get_expire_date", {"_proposer": proposer, "_proposal_id": proposal_id})
    print("Proposal expired at ", proposal_result)

    expire_date = dateutil.parser.parse(proposal_result)
    timestamp = time.mktime(expire_date.timetuple())

    key = ""
    with open('./key.pw') as f:
        key = f.read().strip()
    wallet = KeyWallet.load("../master.key", key)

    transaction = CallTransactionBuilder()\
        .from_(wallet.get_address())\
        .to(SCORE)\
        .step_limit(300000000)\
        .nid(1)\
        .method("set_timestamp")\
        .params({"_proposer": proposer, "_proposal_id": proposal_id, "_expire_date": proposal_result, "_expire_timestamp": timestamp})\
        .build()

    signed_transaction = SignedTransaction(transaction, wallet)
    tx_hash = icon_service.send_transaction(signed_transaction)


def loop_prep():
    prep_result = governance_call("getPReps", {})
    for i in prep_result['preps']:
        is_prep(i['address'])


def is_prep(address):
    verify_result = json_rpc_call("get_verify_info_by_address", {"_address":address})
    result_json = json.loads(verify_result)
    if result_json['ID'] != "":
        proposer = result_json['ID']

        key = ""
        with open('./key.pw') as f:
            key = f.read().strip()
        wallet = KeyWallet.load("../master.key", key)

        transaction = CallTransactionBuilder()\
            .from_(wallet.get_address())\
            .to(SCORE)\
            .step_limit(300000000)\
            .nid(1)\
            .method("add_prep")\
            .params({"_prep_id": proposer})\
            .build()

        signed_transaction = SignedTransaction(transaction, wallet)
        tx_hash = icon_service.send_transaction(signed_transaction)

        print("ID", result_json['ID'])
        last_proposal_id = json_rpc_call("get_last_proposal_id", {"_proposer":proposer})
        print("last pid", last_proposal_id)
        for i in range(1, int(last_proposal_id)+1):
            proposal_id = i

            set_timestamp(proposer, proposal_id)

def main():
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    key = ""
    with open('./key.pw') as f:
        key = f.read().strip()
    wallet = KeyWallet.load("../master.key", key)

    transaction = CallTransactionBuilder()\
        .from_(wallet.get_address())\
        .to(SCORE)\
        .step_limit(300000000)\
        .nid(3)\
        .method("input_verify_count")\
        .params({"_verify_list": "[\"ICXstation\",\"Velic\",\"Ubik\"]"})\
        .build()

    signed_transaction = SignedTransaction(transaction, wallet)
    tx_hash = icon_service.send_transaction(signed_transaction)


if __name__ == '__main__':
    main()
