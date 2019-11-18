from django.db.models import Q
from django.contrib.auth.models import User

import graphene
from graphql import GraphQLError
from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import superuser_required, staff_member_required

from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

import json

from .models import BoardModel, ProposalModel, SelectItemModel, VoteModel

from .icon_network import NETWORK, SCORE_ADDRESS


class BoardModelType(DjangoObjectType):
    class Meta:
        model = BoardModel


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
    all_board = graphene.List(BoardModelType)
    all_proposal = graphene.List(ProposalModelType)
    all_selectitem = graphene.List(SelectItemModelType)
    all_vote = graphene.List(VoteModelType)

    is_voted = graphene.Field(ProposalModelType, proposal_id=graphene.Int())

    proposal = graphene.Field(ProposalModelType, id=graphene.Int())

    proposals = graphene.List(
        ProposalModelType,
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

    def resolve_proposal(self, info, id=None, **kwargs):
        if id == -1:
            return None
        # raise GraphQLError('No Proposal')

        return ProposalModel.objects.get(pk=id)

    def resolve_proposals(self, info, search=None, first=None, skip=None, **kwargs):
        qs = ProposalModel.objects.all()

        if search:
            filter = (Q(subject__icontains=search) | Q(contents__icontains=search)) & (
                Q(author__exact=info.context.user) | Q(publish__exact=True)
            )
            qs = qs.filter(filter)
        if skip:
            qs = qs[skip:]
        if first:
            qs = qs[:first]

        return qs

    def resolve_all_board(self, info, **kwargs):
        return BoardModel.objects.all()

    @staff_member_required
    def resolve_all_proposal(self, info, **kwargs):
        return ProposalModel.objects.select_related("board").all()

    @superuser_required
    def resolve_all_selectitem(self, info, **kwargs):
        return SelectItemModel.objects.select_related("proposal").all()

    @staff_member_required
    def resolve_all_vote(self, info, **kwargs):
        return VoteModel.objects.select_related("selectitem").all()


class SelectItemInput(graphene.InputObjectType):
    index = graphene.Int()
    contents = graphene.String(required=True)


class PublishProposal(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()

    proposal = graphene.Field(ProposalModelType)

    def mutate(self, info, proposal_id):
        proposal = ProposalModel.objects.get(pk=proposal_id)
        proposal.published = True

        icon_service = IconService(HTTPProvider(NETWORK, 3))

        call = CallBuilder()\
            .to(SCORE_ADDRESS)\
            .method("GetVerifyInfoByID")\
            .params({"_ID": info.context.user.username})\
            .build()

        result = icon_service.call(call)
        result_json = json.loads(result)

        if result_json['confirmed']:
            selectItems = SelectItemModel.objects.filter(proposal=proposal)
            _select_item = '['
            for idx, item in enumerate(selectItems):
                _select_item += "\""+item.contents+"\""
                if idx < len(selectItems)-1:
                    _select_item += ','
            _select_item += ']'

            wallet = KeyWallet.load(
                "./key_store_raynear", "ekdrms1!")

            transaction = CallTransactionBuilder()\
                .from_(wallet.get_address())\
                .to(SCORE_ADDRESS)\
                .step_limit(10000000000)\
                .nid(3)\
                .method("SetProposal")\
                .params({"_Subject": proposal.subject, "_Contents": proposal.contents, "_Proposer": proposal.author.username, "_ExpireDate": proposal.expire_at.isoformat(), "_SelectItems": _select_item})\
                .build()

            signed_transaction = SignedTransaction(transaction, wallet)
            tx_hash = icon_service.send_transaction(signed_transaction)

            print(tx_hash)
            tx_result = icon_service.get_transaction_result(tx_hash)
            print(tx_result['status'])
            tx_result_json = json.loads(tx_result)
            print(tx_result_json)

            proposal.txHash = tx_hash
            proposal.save()
        return PublishProposal(proposal=proposal)


class VoteProposal(graphene.Mutation):
    class Arguments:
        select_item_index = graphene.Int()
        proposal_id = graphene.Int()

    #    vote = graphene.Field(VoteModelType)
    proposal = graphene.Field(ProposalModelType)

    def mutate(self, info, proposal_id, select_item_index):
        proposal = ProposalModel.objects.get(pk=proposal_id)
        qs = SelectItemModel.objects.all()
        filter = Q(proposal__exact=proposal) & Q(
            index__exact=select_item_index)
        qs = qs.filter(filter)

        vote = VoteModel.objects.create(voter=info.context.user, select=qs[0])
        vote.save()
        return VoteProposal(proposal=proposal)


class SetProposal(graphene.Mutation):
    class Arguments:
        proposal_id = graphene.Int()
        subject = graphene.String()
        contents = graphene.String(required=True)
        board_id = graphene.Int()
        published = graphene.Boolean()
        expire_at = graphene.DateTime()
        select_item_list = graphene.List(SelectItemInput)

    proposal = graphene.Field(ProposalModelType)

    def mutate(
        self,
        info,
        proposal_id,
        subject,
        contents,
        published,
        board_id,
        expire_at,
        select_item_list,
    ):
        selectedBoard = BoardModel.objects.get(id=board_id)
        try:
            proposal = ProposalModel.objects.get(pk=proposal_id)
        except ProposalModel.DoesNotExist:
            proposal = ProposalModel.objects.create(
                author=info.context.user,
                subject=subject,
                contents=contents,
                published=published,
                board=selectedBoard,
                expire_at=expire_at,
            )
            proposal.save()
            for item in select_item_list:
                selectItem = SelectItemModel.objects.create(
                    proposal=proposal, index=item.index, contents=item.contents
                )
                selectItem.save()
        else:
            proposal.author = info.context.user
            proposal.subject = subject
            proposal.contents = contents
            proposal.published = False
            proposal.board = selectedBoard
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


class MyMutation(graphene.ObjectType):
    set_proposal = SetProposal.Field()
    publish_proposal = PublishProposal.Field()
    vote_proposal = VoteProposal.Field()
