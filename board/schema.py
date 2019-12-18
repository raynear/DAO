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

import json

from account.models import User

from .models import ProposalModel, SelectItemModel, VoteModel

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
        print(result_json)

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
            .params({"_ProposalID": proposal.id, "_UserID": proposal.prep.username, "_VoteItem": select_item_index})\
            .build()

        print("transaction", transaction)

        signed_transaction = SignedTransaction(transaction, wallet)
        print("signed tx", signed_transaction)
        tx_hash = icon_service.send_transaction(signed_transaction)

        print(tx_hash)

        vote = VoteModel.objects.create(voter=info.context.user, select=qs[0])
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

        result = icon_service.call(call)
#        result_json = json.loads(result)
        print("d", result)

        icon_service = IconService(HTTPProvider(NETWORK, 3))
        call = CallBuilder()\
            .to(SCORE)\
            .method("GetVerifyInfoByID")\
            .params({"_ID": user.username})\
            .build()

        result = icon_service.call(call)
        print("result2", result)
#        result_json = json.loads(result)

        # TODO!!!!!!!!!!
        # prep이고 본인 id로 verify 됐으면 셋팅하라

        if result['address'] == icon_address:
            #        if True:
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


class MyMutation(graphene.ObjectType):
    set_proposal = SetProposal.Field()
    publish_proposal = PublishProposal.Field()
    vote_proposal = VoteProposal.Field()
    set_prep = SetPRep.Field()
    add_icon_address = AddIconAddress.Field()
