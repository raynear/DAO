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

from time import sleep
import time
import json
import datetime
import dateutil.parser
import math
import requests
from django.shortcuts import get_object_or_404

from account.models import User

from .models import ProposalModel, SelectItemModel, VoteModel

from .icon_network import ICON_NETWORK, SCORE_ADDRESS
NETWORK = ICON_NETWORK
SCORE = SCORE_ADDRESS

prep_required = user_passes_test(lambda u: u.is_prep)
address_required = user_passes_test(lambda u: u.icon_address)


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
    # all_vote = graphene.List(VoteModelType)

    # is_voted = graphene.Field(ProposalModelType, proposal_id=graphene.Int())

    prep = graphene.Field(CustomUserType, prep_name=graphene.String())

    proposal = graphene.Field(ProposalModelType, id=graphene.Int())
    # proposal4edit = graphene.Field(ProposalModelType, id=graphene.Int())

    proposals = graphene.List(
        ProposalModelType,
        prep=graphene.String(),
        first=graphene.Int(),
        end=graphene.Int(),
    )

    # def resolve_is_voted(self, info, proposal_id):
    #     proposal = ProposalModel.objects.get(pk=proposal_id)
    #     qs = SelectItemModel.objects.all()
    #     qs = qs.filter(Q(proposal__exact=proposal))
    #     flag = False
    #     for item in qs:
    #         qs2 = VoteModel.objects.all()
    #         qs2 = qs2.filter(Q(voter__exact=info.context.user)
    #                          & Q(select__exact=item))
    #         if len(qs2) > 0:
    #             flag = True
    #             return proposal

    #     return None

    def resolve_prep(self, info, prep_name=None, **kwargs):
        return User.objects.get(username=prep_name)

    # @login_required
    # @prep_required
    # def resolve_proposalNViewer(self, info, id=None, **kwargs):
    #     if id == -1:
    #         return None
    #     # raise GraphQLError('No Proposal')
    #     proposal = ProposalModel.objects.get(pk=id)
    #     if proposal.prep == info.context.user:
    #         return proposal
    #     else:
    #         return None

    @login_required
    @prep_required
    def resolve_proposal(self, info, id=None, **kwargs):
        if id == -1:
            return None
        # raise GraphQLError('No Proposal')

        return ProposalModel.objects.get(pk=id)

    @login_required
    @prep_required
    def resolve_proposals(self, info, prep=None, first=None, end=None, **kwargs):
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

        if first is None:
            first = 0
        if end is None:
            end = 1000000
        qs = qs[first:end]

        return qs

    def resolve_all_prep(self, info, **kwargs):
        qs = User.objects.all()
#        finalize_vote(1, "2019:12:19T00:00:00")
        return qs.filter(Q(is_prep__exact=True))

    @login_required
    @prep_required
    def resolve_all_proposal(self, info, **kwargs):
        return ProposalModel.objects.select_related("prep").all()

    @login_required
    @prep_required
    def resolve_all_selectitem(self, info, **kwargs):
        return SelectItemModel.objects.select_related("proposal").all()

    # def resolve_all_vote(self, info, **kwargs):
    #     return VoteModel.objects.select_related("selectitem").all()


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

        print("a")
        result = jsonRpcCall("get_verify_info_by_id", {
            "_id": info.context.user.username})
        # print("AA:", result)
        result_json = json.loads(result)
        print("b", result_json)
        if result_json['address'] != info.context.user.icon_address:
            return PublishProposal(proposal=None)
        print("c")

        selectItems = SelectItemModel.objects.filter(proposal=proposal)
        _select_item = '['
        for idx, item in enumerate(selectItems):
            _select_item += "\"" + item.contents + "\""
            if idx < len(selectItems) - 1:
                _select_item += ','
        _select_item += ']'
        print("d", _select_item)

        key = ""
        with open('./key.pw') as f:
            key = f.read().strip()
        wallet = KeyWallet.load("../master.key", key)
        print("e")

        transaction = CallTransactionBuilder()\
            .from_(wallet.get_address())\
            .to(SCORE)\
            .step_limit(100000000)\
            .nid(1)\
            .method("set_proposal")\
            .params({"_subject": proposal.subject, "_contents": proposal.contents, "_proposer": proposal.prep.username, "_expire_date": proposal.expire_at.isoformat(), "_select_items": _select_item, "_electoral_th": proposal.electoral_th, "_winning_th": proposal.winning_th})\
            .build()

        print("f")
        signed_transaction = SignedTransaction(transaction, wallet)
        print("g")
        tx_hash = icon_service.send_transaction(signed_transaction)
        print("h", tx_hash)

        # print("CC", tx_hash)
        sleep(5)
        tx_result = icon_service.get_transaction_result(tx_hash)

        # print("DD", tx_result)

        if tx_result['status'] == 1:
            proposal.delete()

        return PublishProposal(proposal=None)


class VoteProposal(graphene.Mutation):
    class Arguments:
        select_item_index = graphene.Int()
        proposal_id = graphene.Int()
        proposer = graphene.String()

    # vote = graphene.Field(VoteModelType)
    proposal = graphene.Field(ProposalModelType)

    @address_required
    @login_required
    def mutate(self, info, proposer, proposal_id, select_item_index):
        icon_service = IconService(HTTPProvider(NETWORK, 3))
        # print("ABCDEFG")

        key = ""
        with open('./key.pw') as f:
            key = f.read().strip()
        wallet = KeyWallet.load("../master.key", key)

        transaction = CallTransactionBuilder()\
            .from_(wallet.get_address())\
            .to(SCORE)\
            .step_limit(100000000)\
            .nid(1)\
            .method("vote")\
            .params({"_proposer": proposer, "_proposal_id": proposal_id, "_user_id": info.context.user.username, "_vote_item": select_item_index})\
            .build()

        signed_transaction = SignedTransaction(transaction, wallet)
        tx_hash = icon_service.send_transaction(signed_transaction)
        # print(tx_hash)

        sleep(3)
        tx_result = icon_service.get_transaction_result(tx_hash)
        # print(tx_result)

        # vote = VoteModel.objects.create(voter=info.context.user, select=qs[0])
        # vote.txHash = tx_hash
        # vote.save()
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
                status="Draft",
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

        prep_result = governanceCall("getPRep", {"address": icon_address})

        result = jsonRpcCall("get_verify_info_by_id", {"_id": user.username})
        result_json = json.loads(result)

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

        result = jsonRpcCall("get_verify_info_by_id", {"_id": user.username})
        result_json = json.loads(result)

        if result_json['address'] == icon_address:
            user.icon_address = icon_address
            user.is_prep = False
            user.save()

        return AddIconAddress(user=user)


class Finalize(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()
        proposer = graphene.String()

    proposal = graphene.Field(ProposalModelType)

    @prep_required
    @login_required
    def mutate(self, info, proposer, proposal_id):
        icon_service = IconService(HTTPProvider(NETWORK, 3))
        proposal_result = jsonRpcCall(
            "get_proposal", {"_proposer": proposer, "_proposal_id": proposal_id})
        result_json = json.loads(proposal_result)
        print("Proposal!!!!!!!!!!", result_json)

        final_blockheight = find_blockheight_from_datetime(
            str(result_json['expire_date']))

        resp_vote = jsonRpcCall(
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
            if final_delegate_tx == False:
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
        prep_result = governanceCall(
            "getPReps", {"blockHeight": final_blockheight})

        prep_delegate = 0
        for a_prep in prep_result['preps']:
            if a_prep['address'] == result_json['address']:
                prep_delegate = a_prep['delegated']

        print("prep_delegate!!!!!!!!!!!!!!!!", prep_delegate)

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

        print("AAAAAAAAAAA")

        proposal_result = jsonRpcCall(
            "get_proposal", {"_proposer": proposer, "_proposal_id": proposal_id})
        result_json = json.loads(proposal_result)

        print("BBBBBBBBBBB")

        # proposal.finalizeTxHash = tx_hash
        # proposal.status = result_json['status']
        # proposal.save()

        return Finalize(proposal=None)


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
    resp = requests.get("https://tracker.icon.foundation/v3/address/txList",
                        {'address': address, 'page': 1, 'count': 1000})
    latest_tx = False

    print("!!!!!!!", prep_address, address, block_height)
    print("!@#", resp)

    if resp.status_code == 200:
        """
        resp_text_user1 = '{"data":[{"txHash":"0x53c09a88f787c713f937e7b3a6b4261331d564b092f19d7f23152ca5ea4e269a","height":18,"createDate":"2019-09-21T02:35:34.000+0000","fromAddr":"hxf2d2bcaf5c3ec858b3a12af46d9f632ccea58210","toAddr":"cx0000000000000000000000000000000000000000","txType":"14","dataType":"call","amount":"0","fee":"0.001286","state":1,"errorMsg":null,"targetContractAddr":"cx0000000000000000000000000000000000000000","id":null}],"listSize":1,"totalSize":1,"result":"200","description":"success"}'
        resp_text_user2 = '{"data":[{"txHash":"0xdb058eb0be66b330edc15aa3c1d63d9e356e2f53b1eed9e74ecc6b7addd2a050","height":20,"createDate":"2019-09-21T02:35:34.000+0000","fromAddr":"hxf2d2bcaf5c3ec858b3a12af46d9f632ccea58210","toAddr":"cx0000000000000000000000000000000000000000","txType":"14","dataType":"call","amount":"0","fee":"0.001286","state":1,"errorMsg":null,"targetContractAddr":"cx0000000000000000000000000000000000000000","id":null}],"listSize":1,"totalSize":1,"result":"200","description":"success"}'
        resp_text_user3 = '{"data":[{"txHash":"0x138a104f65a1cf23b4fa53af75e8967e65c651111cefa743312efad6ed897d6b","height":22,"createDate":"2019-09-21T02:35:34.000+0000","fromAddr":"hxf2d2bcaf5c3ec858b3a12af46d9f632ccea58210","toAddr":"cx0000000000000000000000000000000000000000","txType":"14","dataType":"call","amount":"0","fee":"0.001286","state":1,"errorMsg":null,"targetContractAddr":"cx0000000000000000000000000000000000000000","id":null}],"listSize":1,"totalSize":1,"result":"200","description":"success"}'
        #
        #
        # tracker에 연동하는 부분은 local과 연동 안되므로 dummy로 대체함
        #
        #
        resp_text = resp_text_user3
        if address == "hxecb5942964bd920f92b53997a4b274f5bcbb7544":
            resp_text = resp_text_user1
        if address == "hx8ac83a8c5a842352699921d90bcaae6686d7cafe":
            resp_text = resp_text_user2
        if address == "hx52672f706f3b1af440637a0d00c96beed4dee71c":
            resp_text = resp_text_user3
        resp_json = json.loads(resp_text)
        """
        tx_list = resp.json()['data']

        # print("resp_json", resp_json)
        # print("tx_list", tx_list)

        icon_service = IconService(HTTPProvider(NETWORK, 3))

        for a_tx in tx_list:
            # print("a")
            if a_tx['height'] < block_height and a_tx['toAddr'] == "cx0000000000000000000000000000000000000000":
                # print("b")
                tx_detail = icon_service.get_transaction(a_tx['txHash'])
                # print("tx_detail", tx_detail)
                if tx_detail['data']['method'] == "setDelegation":
                    # print("c")
                    if latest_tx == False or latest_tx['blockHeight'] < tx_detail['blockHeight']:
                        # 1 번만 나오면 순서대로 동작하는거니 처음껄로 리턴하면 됨
                        # print("!!!!!!!!!!!!!!!!!!!!!!")
                        latest_tx = tx_detail

        return latest_tx


def governanceCall(method, params):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    call = CallBuilder()\
        .to("cx0000000000000000000000000000000000000000")\
        .method(method)\
        .params(params)\
        .build()
    result = icon_service.call(call)
    return result


def jsonRpcCall(method, params):
    icon_service = IconService(HTTPProvider(NETWORK, 3))
    call = CallBuilder()\
        .to(SCORE)\
        .method(method)\
        .params(params)\
        .build()
    result = icon_service.call(call)
    return result


def finalize_vote(proposer, proposal_id, expire_datetime):
    final_blockheight = find_blockheight_from_datetime(expire_datetime)

    resp_vote = jsonRpcCall(
        "get_votes", {"_proposer": proposer, "_proposal_id": proposal_id})
    vote_json = json.loads(resp_vote)
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

        if a_vote.select_item in select_list:
            select_list[a_vote.select_item] += delegate_amount
        else:
            select_list[a_vote.select_item] = delegate_amount


class MyMutation(graphene.ObjectType):
    set_proposal = SetProposal.Field()
    publish_proposal = PublishProposal.Field()
    vote_proposal = VoteProposal.Field()
    set_prep = SetPRep.Field()
    add_icon_address = AddIconAddress.Field()
    finalize = Finalize.Field()
