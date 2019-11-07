from django.db.models import Q
from django.contrib.auth.models import User

import graphene
from graphql import GraphQLError
from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import superuser_required, staff_member_required

from .models import BoardModel, ProposalModel, SelectItemModel, VoteModel


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
