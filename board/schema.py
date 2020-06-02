from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db import models

import json

import graphene
from graphene_django.types import DjangoObjectType

from graphql import GraphQLError
from graphql_jwt.decorators import superuser_required, staff_member_required, login_required, user_passes_test

from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

from account.models import User
from .models import ProposalModel, SelectItemModel
from .icon_network import ICON_NETWORK, SCORE_ADDRESS

import logging
logger = logging.getLogger(__name__)

GOVERNANCE_NETWORK = ICON_NETWORK
CONTRACT_NETWORK = ICON_NETWORK
SCORE = SCORE_ADDRESS


class CustomUserType(DjangoObjectType):
    class Meta:
        model = User


class ProposalModelType(DjangoObjectType):
    class Meta:
        model = ProposalModel


class SelectItemModelType(DjangoObjectType):
    class Meta:
        model = SelectItemModel


class IntModel(models.Model):
    aInt = models.IntegerField(default=0)

    def __str__(self):
        return str(self.aInt)


class IntModelType(DjangoObjectType):
    class Meta:
        model = IntModel


class Query(object):
    all_prep = graphene.List(CustomUserType)
    all_proposal = graphene.List(ProposalModelType)
    all_selectitem = graphene.List(SelectItemModelType)

    prep = graphene.Field(CustomUserType, prep_name=graphene.String())

    proposal = graphene.Field(ProposalModelType, id=graphene.Int())

    proposals = graphene.List(
        ProposalModelType,
        prep=graphene.String(),
        first=graphene.Int(),
        end=graphene.Int(),
    )

    proposal_cnt = graphene.Field(
        IntModelType, prep=graphene.String())

    def resolve_prep(self, info, prep_name=None, **kwargs):
        return User.objects.get(username=prep_name)

    @login_required
    def resolve_proposal(self, info, id=None, **kwargs):
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return None
        if id == -1:
            return None

        return ProposalModel.objects.get(pk=id)

    @login_required
    def resolve_proposals(self, info, prep=None, first=None, end=None, **kwargs):
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return None
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

    @login_required
    def resolve_proposal_cnt(self, info, prep=None, **kwargs):
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return None
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

        IntModel.objects.all().delete()
        aInt = IntModel.objects.create(aInt=qs.count())

        return aInt

    def resolve_all_prep(self, info, **kwargs):
        qs = User.objects.all()
        return qs.filter(Q(is_prep__exact=True))

    @login_required
    def resolve_all_proposal(self, info, **kwargs):
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return None
        return ProposalModel.objects.select_related("prep").all()

    @login_required
    def resolve_all_selectitem(self, info, **kwargs):
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return None
        return SelectItemModel.objects.select_related("proposal").all()


class SelectItemInput(graphene.InputObjectType):
    index = graphene.Int()
    contents = graphene.String(required=True)


class PublishProposal(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()

    tx = graphene.String()

    @login_required
    def mutate(self, info, proposal_id):
        logger.debug("publish proposal")
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return PublishProposal(proposal=None)
        proposal = ProposalModel.objects.get(pk=proposal_id)

        icon_service = IconService(HTTPProvider(CONTRACT_NETWORK, 3))

        result = jsonRpcCall("get_verify_info_by_id", {"_id": info.context.user.username})
        result_json = json.loads(result)

        selectItems = SelectItemModel.objects.filter(proposal=proposal)
        _select_item = '['
        for idx, item in enumerate(selectItems):
            _select_item += "\"" + item.contents + "\""
            if idx < len(selectItems) - 1:
                _select_item += ','
        _select_item += ']'

        logger.debug(proposal)
        logger.debug(_select_item)

        key = ""
        with open('./key.pw') as f:
            key = f.read().strip()
        wallet = KeyWallet.load("../master.key", key)

        vote_page = "Community" if proposal.isPublicVote else "MyVoter"
        logger.debug("param", {"_subject": proposal.subject, "_contents": proposal.contents, "_proposer": proposal.prep.username, "_expire_timestamp": int(proposal.expire_at.timestamp()*1000), "_select_items": _select_item, "_electoral_th": proposal.electoral_th, "_winning_th": proposal.winning_th, "_vote_page": vote_page})
        transaction = CallTransactionBuilder()\
            .from_(wallet.get_address())\
            .to(SCORE)\
            .step_limit(100000000)\
            .nid(1)\
            .method("set_proposal")\
            .params({"_subject": proposal.subject, "_contents": proposal.contents, "_proposer": proposal.prep.username, "_expire_timestamp": int(proposal.expire_at.timestamp()*1000), "_select_items": _select_item, "_electoral_th": proposal.electoral_th, "_winning_th": proposal.winning_th, "_vote_page": vote_page})\
            .build()

        signed_transaction = SignedTransaction(transaction, wallet)
        logger.debug("signed_tx", signed_transaction)
        tx_hash = icon_service.send_transaction(signed_transaction)
        logger.debug("tx_hash", tx_hash)

        return PublishProposal(tx=tx_hash)


class VoteProposal(graphene.Mutation):
    class Arguments:
        select_item_index = graphene.Int()
        proposal_id = graphene.Int()
        proposer = graphene.String()

    tx = graphene.String()

    @login_required
    def mutate(self, info, proposer, proposal_id, select_item_index):
        logger.debug("vote proposal")
        result = jsonRpcCall("get_verify_info_by_id", {"_id": info.context.user.username})
        if result.find("is not verified") != -1:
            return VoteProposal(tx=None)

        result_json = json.loads(result)

        voter_address = result_json["address"]

        icon_service = IconService(HTTPProvider(CONTRACT_NETWORK, 3))

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
            .params({"_proposer": proposer, "_proposal_id": proposal_id, "_voter_address": voter_address, "_vote_item": select_item_index})\
            .build()

        signed_transaction = SignedTransaction(transaction, wallet)
        tx_hash = icon_service.send_transaction(signed_transaction)

        return VoteProposal(tx=tx_hash)


class SetProposal(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()
        isPublicVote = graphene.Boolean()
        subject = graphene.String()
        contents = graphene.String(required=True)
        published = graphene.Boolean()
        expire_at = graphene.DateTime()
        electoral_th = graphene.Int()
        winning_th = graphene.Int()
        select_item_list = graphene.List(SelectItemInput)

    proposal = graphene.Field(ProposalModelType)

    @login_required
    def mutate(
        self,
        info,
        proposal_id,
        subject,
        contents,
        isPublicVote,
        published,
        electoral_th,
        winning_th,
        expire_at,
        select_item_list,
    ):
        logger.debug("set proposal")
        if not jsonRpcCall("is_prep", {"_id":info.context.user.username}):
            return SetProposal(proposal=None)
        try:
            proposal = ProposalModel.objects.get(pk=proposal_id)
        except ProposalModel.DoesNotExist:
            proposal = ProposalModel.objects.create(
                prep=info.context.user,
                status="Draft",
                isPublicVote=isPublicVote,
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
            proposal.isPublicVote = isPublicVote
            proposal.subject = subject
            proposal.contents = contents
            proposal.published = False
            proposal.electoral_th = electoral_th
            proposal.winning_th = winning_th
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

    prep = graphene.Field(CustomUserType)

    @login_required
    def mutate(self, info, icon_address):
        logger.debug("set prep")
        user = info.context.user

        prep_result = governanceCall("getPRep", {"address": icon_address})
        logger.debug(prep_result)

        result = jsonRpcCall("get_verify_info_by_id", {"_id": user.username})
        result_json = json.loads(result)
        logger.debug(result)

        if prep_result and result_json['address'] == icon_address:
            user.is_prep = True
            user.save()

            icon_service = IconService(HTTPProvider(CONTRACT_NETWORK, 3))

            key = ""
            with open('./key.pw') as f:
                key = f.read().strip()
            wallet = KeyWallet.load("../master.key", key)

            transaction = CallTransactionBuilder()\
                .from_(wallet.get_address())\
                .to(SCORE)\
                .step_limit(100000000)\
                .nid(1)\
                .method("add_prep")\
                .params({"_prep_id": user.username})\
                .build()

            signed_transaction = SignedTransaction(transaction, wallet)
            tx_hash = icon_service.send_transaction(signed_transaction)
            logger.debug(tx_hash)

            return SetPRep(prep=user)


class AddIconAddress(graphene.Mutation):
    class Arguments:
        icon_address = graphene.String()

    user = graphene.Field(CustomUserType)

    @login_required
    def mutate(self, info, icon_address):
        logger.debug("add icon address")
        user = info.context.user

        result = jsonRpcCall("get_verify_info_by_id", {"_id": user.username})
        result_json = json.loads(result)

        if result_json['address'] == icon_address:
            user.is_prep = False
            user.save()

        return AddIconAddress(user=user)


def governanceCall(method, params):
    icon_service = IconService(HTTPProvider(GOVERNANCE_NETWORK, 3))
    call = CallBuilder()\
        .to("cx0000000000000000000000000000000000000000")\
        .method(method)\
        .params(params)\
        .build()
    result = icon_service.call(call)
    return result


def jsonRpcCall(method, params):
    icon_service = IconService(HTTPProvider(CONTRACT_NETWORK, 3))
    call = CallBuilder()\
        .to(SCORE)\
        .method(method)\
        .params(params)\
        .build()
    result = icon_service.call(call)
    return result


class MyMutation(graphene.ObjectType):
    set_proposal = SetProposal.Field()
    publish_proposal = PublishProposal.Field()
    vote_proposal = VoteProposal.Field()
    set_prep = SetPRep.Field()
    add_icon_address = AddIconAddress.Field()
