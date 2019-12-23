from django.db.models import Q
import graphene
from graphql import GraphQLError
from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import superuser_required, staff_member_required, login_required, user_passes_test

from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

import time
import json
import datetime
import dateutil.parser
import math
import requests
from django.shortcuts import get_object_or_404

from account.models import User

from .models import ProposalModel, SelectItemModel, VoteModel, Status

from .icon_network import MAIN_NET, TEST_NET, TEST_NET3, LOCAL_NET, SCORE_ADDRESS, LOCAL_SCORE_ADDRESS
NETWORK = LOCAL_NET
SCORE = LOCAL_SCORE_ADDRESS

prep_required = user_passes_test(lambda u: u.is_prep)


class CustomUserType(DjangoObjectType):
    class Meta:
        model = User


class ProposalModelType(DjangoObjectType):
    class Meta:
        model = ProposalModel


class SelectItemModelType(DjangoObjectType):
    class Meta:
        model = SelectItemModel


class VoteModelType(DjangoObjectType):
    class Meta:
        model = VoteModel


class Query(object):
    all_prep = graphene.List(CustomUserType)
    all_proposal = graphene.List(ProposalModelType)
    all_selectitem = graphene.List(SelectItemModelType)
    all_vote = graphene.List(VoteModelType)

    is_voted = graphene.Field(ProposalModelType, proposal_id=graphene.Int())

    prep = graphene.Field(CustomUserType, prep_name=graphene.String())

    proposal = graphene.Field(ProposalModelType, id=graphene.Int())

    proposals = graphene.List(
        ProposalModelType,
        prep=graphene.String(),
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
    )

    def resolve_is_voted(self, info, proposal_id):
        proposal = ProposalModel.objects.get(pk=proposal_id)
        qs = SelectItemModel.objects.all()
        qs = qs.filter(Q(proposal__exact=proposal))
        flag = False
        for item in qs:
            qs2 = VoteModel.objects.all()
            qs2 = qs2.filter(Q(voter__exact=info.context.user)
                             & Q(select__exact=item))
            if len(qs2) > 0:
                flag = True
                return proposal

        return None

    def resolve_prep(self, info, prep_name=None, **kwargs):
        return User.objects.get(username=prep_name)

    def resolve_proposal(self, info, id=None, **kwargs):
        if id == -1:
            return None
        # raise GraphQLError('No Proposal')

        return ProposalModel.objects.get(pk=id)

    def resolve_proposals(self, info, prep=None, search=None, first=None, skip=None, **kwargs):
        qs = ProposalModel.objects.all()

        if info.context.user.is_authenticated:
            filter = Q(prep__exact=info.context.user) | Q(
                published__exact=True)
            qs = qs.filter(filter)
        else:
            filter = Q(published__exact=True)
            qs = qs.filter(filter)

        if (prep is not None) and (prep != ""):
            aPRep = User.objects.get(username=prep)
            filter = Q(prep__exact=aPRep)
            qs = qs.filter(filter)

        if search:
            filter = (Q(subject__icontains=search) |
                      Q(contents__icontains=search))
            qs = qs.filter(filter)
        if skip:
            qs = qs[skip:]
        if first:
            qs = qs[:first]

        return qs

    def resolve_all_prep(self, info, **kwargs):
        qs = User.objects.all()
#        finalize_vote(1, "2019:12:19T00:00:00")
        return qs.filter(Q(is_prep__exact=True))

    def resolve_all_proposal(self, info, **kwargs):
        return ProposalModel.objects.select_related("prep").all()

    def resolve_all_selectitem(self, info, **kwargs):
        return SelectItemModel.objects.select_related("proposal").all()

    def resolve_all_vote(self, info, **kwargs):
        return VoteModel.objects.select_related("selectitem").all()


class SelectItemInput(graphene.InputObjectType):
    index = graphene.Int()
    contents = graphene.String(required=True)


class PublishProposal(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()

    proposal = graphene.Field(ProposalModelType)

    @login_required
    @prep_required
    def mutate(self, info, proposal_id):
        proposal = ProposalModel.objects.get(pk=proposal_id)

        icon_service = IconService(HTTPProvider(NETWORK, 3))
        print(SCORE)
        print(info.context.user.username)

        call = CallBuilder()\
            .to(SCORE)\
            .method("GetVerifyInfoByID")\
            .params({"_ID": info.context.user.username})\
            .build()

        result = icon_service.call(call)
        print(result)
        result_json = json.loads(result)
        print("have to check not verified return", result_json)

        call = CallBuilder()\
            .to(SCORE)\
            .method("GetLastProposalID")\
            .params({"_Proposer": info.context.user.username})\
            .build()

        result = icon_service.call(call)
        print(result)

        pid = int(result) + 1

        selectItems = SelectItemModel.objects.filter(proposal=proposal)
        _select_item = '['
        for idx, item in enumerate(selectItems):
            _select_item += "\"" + item.contents + "\""
            if idx < len(selectItems) - 1:
                _select_item += ','
        _select_item += ']'

        print("selectitem", _select_item)

        f = open("./key.pw", 'r')
        line = f.readline()
        wallet = KeyWallet.load(
            "./key_store_raynear", line)

        transaction = CallTransactionBuilder()\
            .from_(wallet.get_address())\
            .to(SCORE)\
            .step_limit(10000000000)\
            .nid(3)\
            .method("SetProposal")\
            .params({"_Subject": proposal.subject, "_Contents": proposal.contents, "_Proposer": proposal.prep.username, "_ExpireDate": proposal.expire_at.isoformat(), "_SelectItems": _select_item, "_ElectoralTH": proposal.electoral_th, "_WinningTH": proposal.winning_th})\
            .build()

        print({"_Subject": proposal.subject, "_Contents": proposal.contents, "_Proposer": proposal.prep.username, "_ExpireDate": proposal.expire_at.isoformat(
        ), "_SelectItems": _select_item, "_ElectoralTH": proposal.electoral_th, "_WinningTH": proposal.winning_th})
        print("transaction", transaction)

        signed_transaction = SignedTransaction(transaction, wallet)
        print("signed tx", signed_transaction)
        tx_hash = icon_service.send_transaction(signed_transaction)

        print(tx_hash)
#        tx_result = icon_service.get_transaction_result(tx_hash)
#        print(tx_result)
#        tx_result_json = json.loads(tx_result)
#        print(tx_result_json)

        proposal.published = True
        proposal.prep_pid = pid
        proposal.txHash = tx_hash
        proposal.save()
        return PublishProposal(proposal=proposal)


class VoteProposal(graphene.Mutation):
    class Arguments:
        select_item_index = graphene.Int()
        proposal_id = graphene.Int()

    #    vote = graphene.Field(VoteModelType)
    proposal = graphene.Field(ProposalModelType)

    @login_required
    def mutate(self, info, proposal_id, select_item_index):
        proposal = ProposalModel.objects.get(pk=proposal_id)
        qs = SelectItemModel.objects.all()
        filter = Q(proposal__exact=proposal) & Q(
            index__exact=select_item_index)
        qs = qs.filter(filter)

        icon_service = IconService(HTTPProvider(NETWORK, 3))

        f = open("./key.pw", 'r')
        line = f.readline()
        wallet = KeyWallet.load("./key_store_raynear", line)

        transaction = CallTransactionBuilder()\
            .from_(wallet.get_address())\
            .to(SCORE)\
            .step_limit(10000000000)\
            .nid(3)\
            .method("Vote")\
            .params({"_Proposer": proposal.prep.username, "_ProposalID": proposal.prep_pid, "_UserID": info.context.user.username, "_VoteItem": select_item_index})\
            .build()

        print("transaction", transaction)

        signed_transaction = SignedTransaction(transaction, wallet)
        print("signed tx", signed_transaction)
        tx_hash = icon_service.send_transaction(signed_transaction)

        print(tx_hash)

        vote = VoteModel.objects.create(voter=info.context.user, select=qs[0])
        vote.txHash = tx_hash
        vote.save()
        return VoteProposal(proposal=proposal)


class SetProposal(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()
        subject = graphene.String()
        contents = graphene.String(required=True)
        published = graphene.Boolean()
        expire_at = graphene.DateTime()
        electoral_th = graphene.Int()
        winning_th = graphene.Int()
        select_item_list = graphene.List(SelectItemInput)

    proposal = graphene.Field(ProposalModelType)

    @login_required
    @prep_required
    def mutate(
        self,
        info,
        proposal_id,
        subject,
        contents,
        published,
        electoral_th,
        winning_th,
        expire_at,
        select_item_list,
    ):
        try:
            proposal = ProposalModel.objects.get(pk=proposal_id)
        except ProposalModel.DoesNotExist:
            proposal = ProposalModel.objects.create(
                prep=info.context.user,
                subject=subject,
                contents=contents,
                published=published,
                electoral_th=electoral_th,
                winning_th=winning_th,
                expire_at=expire_at,
            )
            proposal.save()
            for item in select_item_list:
                selectItem = SelectItemModel.objects.create(
                    proposal=proposal, index=item.index, contents=item.contents
                )
                selectItem.save()
        else:
            proposal.prep = info.context.user
            proposal.subject = subject
            proposal.contents = contents
            proposal.published = False
            proposal.electoral_th = electoral_th
            proposal.winning_th = winning_th
            proposal.prep = info.context.user
            proposal.expire_at = expire_at
            proposal.save()

            selectItems = SelectItemModel.objects.filter(proposal=proposal)
            for aItem in selectItems:
                aItem.delete()

            for item in select_item_list:
                selectItem = SelectItemModel.objects.create(
                    proposal=proposal, index=item.index, contents=item.contents
                )
                selectItem.save()
        return SetProposal(proposal=proposal)


class SetPRep(graphene.Mutation):
    class Arguments:
        icon_address = graphene.String()

    #    vote = graphene.Field(VoteModelType)
    prep = graphene.Field(CustomUserType)

    @login_required
    def mutate(self, info, icon_address):
        user = info.context.user

        icon_service = IconService(HTTPProvider(NETWORK, 3))
        call = CallBuilder()\
            .to("cx0000000000000000000000000000000000000000")\
            .method("getPRep")\
            .params({"address": icon_address})\
            .build()

        prep_result = icon_service.call(call)
#        result_json = json.loads(prep_result)
#        print("d", prep_result, result_json)

        icon_service = IconService(HTTPProvider(NETWORK, 3))
        call = CallBuilder()\
            .to(SCORE)\
            .method("GetVerifyInfoByID")\
            .params({"_ID": user.username})\
            .build()

        result = icon_service.call(call)
#        print("result2", result)
        result_json = json.loads(result)

        # TODO!!!!!!!!!!
        # prep이고 본인 id로 verify 됐으면 셋팅하라

        if prep_result and result_json['address'] == icon_address:
            user.icon_address = icon_address
            user.is_prep = True
            user.save()

        return SetPRep(prep=user)


class AddIconAddress(graphene.Mutation):
    class Arguments:
        icon_address = graphene.String()

    #    vote = graphene.Field(VoteModelType)
    user = graphene.Field(CustomUserType)

    @login_required
    def mutate(self, info, icon_address):
        user = info.context.user

        icon_service = IconService(HTTPProvider(NETWORK, 3))
        call = CallBuilder()\
            .to(SCORE)\
            .method("GetVerifyInfoByID")\
            .params({"_ID": user.username})\
            .build()

        result = icon_service.call(call)
        result_json = json.loads(result)

        if result_json['address'] == icon_address:
            user.icon_address = icon_address
            user.save()

        return AddIconAddress(user=user)


class Finalize(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()

    proposal = graphene.Field(ProposalModelType)

    @login_required
    def mutate(self, info, proposal_id):
        proposal = ProposalModel.objects.get(pk=proposal_id)
        print(proposal.expire_at)
        final_blockheight = find_blockheight_from_datetime(
            str(proposal.expire_at))
        print(final_blockheight)

        print("a")
        proposer = proposal.prep.username
        resp_vote = json_rpc_call(
            "GetVotes", {"_Proposer": proposer, "_ProposalID": proposal.prep_pid})
        print("b", resp_vote)
        vote_json = json.loads(resp_vote)
        print("c", vote_json)
        final_delegate_tx_list = []
        select_list = {}
        for a_vote in vote_json['vote']:
            final_delegate_tx = get_final_delegate_tx(proposer,
                                                      a_vote['voter'], final_blockheight)
            print("final delegate tx", final_delegate_tx)
#            final_delegate_tx_list.append(final_delegate_tx)
            print("final delegate tx", final_delegate_tx_list)
            tx_amount = 0
            tx_id = ""
            for delegate in final_delegate_tx['data']['params']['delegations']:
                if delegate['address'] == proposal.prep.icon_address:
                    tx_amount = delegate['value']
                    tx_id = final_delegate_tx['txHash']

            final_delegate_tx_list.append(
                {"DelegateTxID": final_delegate_tx['txHash'], "DelegateAmount": tx_amount})

            if a_vote['selectItem'] in select_list:
                select_list[a_vote['selectItem']] += tx_amount
            else:
                select_list[a_vote['selectItem']] = tx_amount

        print(final_delegate_tx_list)
        print(select_list)

        # 최종 결과 dict로 만들어서 SCORE에 전송
        # 1. final delegate txid
        # 2. voting result
        #

        return Finalize(proposal=proposal)


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


'''
  async function (datetime: string) {
    // 주어진 datetime 바로 전에 생성된 block height
    const givenDate = new Date(datetime);
    const delegateStartBlockHeight = 9000000;
    const lastBlock = { height: 12245388 };//await selected_icon_service.getBlock('latest').execute();

    let min = delegateStartBlockHeight;
    let max = lastBlock.height;
    let findFlag = false;
    while (!findFlag) {
      let curr = Math.floor((min + max) / 2);
      if (curr === min || curr === max) {
        findFlag = true;
      }
      const respBlock = await axios.get("https://tracker.icon.foundation/v3/block/info", { params: { height: curr } });
      const currDate = new Date(respBlock.data.data.createDate);
      if (currDate < givenDate) {
        min = curr;
      } else {
        max = curr;
      }
    }

    const maxBlock = await axios.get("https://tracker.icon.foundation/v3/block/info", { params: { height: max } });
    const maxDate = new Date(maxBlock.data.data.createDate);
    const minBlock = await axios.get("https://tracker.icon.foundation/v3/block/info", { params: { height: min } });
    const minDate = new Date(minBlock.data.data.createDate);
    if (givenDate < maxDate) {
      if (givenDate < minDate) {
        return min - 1;
      }
      else {
        return min;
      }
    } else {
      return max;
    }
  }
'''


def get_final_delegate_tx(prep_address, address, block_height):
    resp = requests.get("https://tracker.icon.foundation/v3/address/txList",
                        {'address': address, 'page': 1, 'count': 1000})
    latest_tx = False
    print("1", address, block_height)

    if resp.status_code == 200:
        print("2", resp)
        resp_text_user1 = '{"data":[{"txHash":"0x9fb20f98bdcdc5287545ceae343c3302fc185b7154d3aac2dca833a7e7f60697","height":18,"createDate":"2019-09-21T02:35:34.000+0000","fromAddr":"hxf2d2bcaf5c3ec858b3a12af46d9f632ccea58210","toAddr":"cx0000000000000000000000000000000000000000","txType":"14","dataType":"call","amount":"0","fee":"0.001286","state":1,"errorMsg":null,"targetContractAddr":"cx0000000000000000000000000000000000000000","id":null}],"listSize":1,"totalSize":1,"result":"200","description":"success"}'
        resp_text_user2 = '{"data":[{"txHash":"0xb992036a9125a95cfb9fa1308b8b77239f68add7d174b71ad2b8eb2195f12a1d","height":20,"createDate":"2019-09-21T02:35:34.000+0000","fromAddr":"hxf2d2bcaf5c3ec858b3a12af46d9f632ccea58210","toAddr":"cx0000000000000000000000000000000000000000","txType":"14","dataType":"call","amount":"0","fee":"0.001286","state":1,"errorMsg":null,"targetContractAddr":"cx0000000000000000000000000000000000000000","id":null}],"listSize":1,"totalSize":1,"result":"200","description":"success"}'
        resp_text_user3 = '{"data":[{"txHash":"0xa6c32ea6f97b8860a98cc2086b86c23d3399a4b726224a6304c4d494d4331916","height":22,"createDate":"2019-09-21T02:35:34.000+0000","fromAddr":"hxf2d2bcaf5c3ec858b3a12af46d9f632ccea58210","toAddr":"cx0000000000000000000000000000000000000000","txType":"14","dataType":"call","amount":"0","fee":"0.001286","state":1,"errorMsg":null,"targetContractAddr":"cx0000000000000000000000000000000000000000","id":null}],"listSize":1,"totalSize":1,"result":"200","description":"success"}'
        #
        #
        # tracker에 연동하는 부분은 local과 연동 안되므로 dummy로 대체함
        #
        #
        if address == "hxecb5942964bd920f92b53997a4b274f5bcbb7544":
            resp_text = resp_text_user1
        if address == "hx8ac83a8c5a842352699921d90bcaae6686d7cafe":
            resp_text = resp_text_user2
        if address == "hx52672f706f3b1af440637a0d00c96beed4dee71c":
            resp_text = resp_text_user3
        resp_json = json.loads(resp_text)
        print("3", resp_json)
        tx_list = resp_json['data']
        print("4", tx_list)

        icon_service = IconService(HTTPProvider(NETWORK, 3))

        for a_tx in tx_list:
            print("5", a_tx)
            print(a_tx['height'])
            print(block_height)
            print(a_tx['toAddr'])
            if a_tx['height'] < block_height and a_tx['toAddr'] == "cx0000000000000000000000000000000000000000":
                print("6")
                tx_detail = icon_service.get_transaction(a_tx['txHash'])
#                resp_tx_detail = requests.get("https://tracker.icon.foundation/v3/transaction/txDetail", {'txHash': a_tx['txHash']})
#                print("7", tx)
#                resp_tx_json = json.loads(resp_tx_detail.text)
#                print("8")
#                tx_detail = resp_tx['data']
                print("9")
                if tx_detail['data']['method'] == "setDelegation":
                    if latest_tx == False or latest_tx['blockHeight'] < tx_detail['blockHeight']:
                        # 1 번만 나오면 순서대로 동작하는거니 처음껄로 리턴하면 됨
                        print("!!!!!!!!!!!!!!!!!!!!!!")
                        latest_tx = tx_detail

        print("10")
        return latest_tx


'''
  async function CalculateFinalVoteRate(address: string, blockHeight: number) {
    let latestTx: any = false;

    const respTxList = await axios.get("https://tracker.icon.foundation/v3/address/txList", { params: { address: address, page: 1, count: 1000 } })
    const txList = respTxList.data.data;
    const txCnt = respTxList.data.listSize;
    const txTotalCnt = respTxList.data.totalSize;

    for (let aTxKey in txList) {
      const aTx = txList[aTxKey];
      if (aTx.height < blockHeight && aTx.toAddr === "cx0000000000000000000000000000000000000000") {
        const respTxDetail = await axios.get("https://tracker.icon.foundation/v3/transaction/txDetail", { params: { txHash: aTx.txHash } });
        const txDetail = respTxDetail.data.data;
        const txData = JSON.parse(txDetail.dataString);
        if (txData.method === "setDelegation") {
          if (latestTx.height < aTx.height || latestTx === false) {
            latestTx = aTx;
          }
        }
      }
    }
    return latestTx;
  }
'''


def json_rpc_call(method, params):
    print("!", NETWORK, SCORE, method, params)
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    print("@")
    call = CallBuilder()\
        .to(SCORE)\
        .method(method)\
        .params(params)\
        .build()
    print("$", call)
    result = icon_service.call(call)
    print("%", result)
    return result


def finalize_vote(proposer, proposal_id, expire_datetime):
    final_blockheight = find_blockheight_from_datetime(expire_datetime)
    print(final_blockheight)

    print("a")
    resp_vote = json_rpc_call(
        "GetVotes", {"_Proposer": proposer, "_ProposalID": proposal_id})
    print("b", resp_vote)
    vote_json = json.loads(resp_vote)
    print("c", vote_json)
    final_delegate_tx_list = []
    select_list = {}
    for a_vote in vote_json['votes']:
        final_delegate_tx = get_final_delegate_tx(proposer,
                                                  a_vote.voter, expire_blockheight)
        final_delegate_tx_list.append(final_delegate_tx)

        delegate_amount = 0
        for delegate in final_delegate_tx:
            if delegate.address == prep_address:
                delegate_amount = delegate.amount

        print("FinalDelegateAmount", delegate_amount)
        if a_vote.select_item in select_list:
            select_list[a_vote.select_item] += delegate_amount
        else:
            select_list[a_vote.select_item] = delegate_amount


'''
  async function FinalizeVote(proposalId:string, expireDatetime:string) {
      const expireBlockHeight = await FindBlockHeightFromDatetime(expireDatetime);
      console.log("find blockheight from datetime", expireDatetime, expireBlockHeight);
        
      const votes = await json_rpc_call("GetVotes", {_ProposalID:proposalId});
      const result_json = JSON.parse(votes);
      for(let i=0 ; i<result_json.length ; i++){
        const finalDelegateTx= await CalculateFinalVoteRate(result_json[i].voter, expireBlockHeight);
        console.log("FinalDelegateTx", finalDelegateTx);
      }
  }
'''


class MyMutation(graphene.ObjectType):
    set_proposal = SetProposal.Field()
    publish_proposal = PublishProposal.Field()
    vote_proposal = VoteProposal.Field()
    set_prep = SetPRep.Field()
    add_icon_address = AddIconAddress.Field()
    finalize = Finalize.Field()
