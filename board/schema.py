import graphene

from graphene_django.types import DjangoObjectType
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

    def resolve_all_board(self, info, **kwargs):
        return BoardModel.objects.all()

    def resolve_all_proposal(self, info, **kwargs):
        return ProposalModel.objects.select_related('board').all()

    def resolve_all_selectitem(self, info, **kwargs):
        return SelectItemModel.objects.select_related('proposal').all()

    def resolve_all_vote(self, info, **kwargs):
        return VoteModel.objects.select_related('selectitem').all()


class NewProposal(graphene.Mutation):
    class Arguments:
        subject = graphene.String()
        contents = graphene.String(required=True)
        boardID = graphene.String()
        expire_at = graphene.DateTime()
        #proposal_data = ProposalInput(required=True)

    #proposal = graphene.Field(ProposalModel)
    proposal = graphene.Field(ProposalModelType)

    def mutate(self, info, subject, contents, boardID, expire_at):
        #        proposal = ProposalModel(
        #            subject=proposal_data.subject,
        #            contents=proposal_data.contents
        #        )
        #proposal = ProposalModel(subject=subject, contents=contents, pk=id)
        selectedBoard = BoardModel.objects.get(id=boardID)
        proposal = ProposalModel.objects.create(
            subject=subject,
            contents=contents,
            board=selectedBoard,
            expire_at=expire_at)
        proposal.save()
        return NewProposal(proposal=proposal)


class NewSelectItem(graphene.Mutation):
    class Arguments:
        proposalID = graphene.String()
        contents = graphene.String(required=True)

    selectItem = graphene.Field(SelectItemModelType)

    def mutate(self, info, proposalID, contents):
        selectedProposal = ProposalModel.objects.get(id=proposalID)
        selectItem = SelectItemModel.objects.create(
            proposal=selectedProposal,
            contents=contents)
        selectItem.save()
        return NewSelectItem(selectItem=selectItem)


class MyMutation(graphene.ObjectType):
    new_proposal = NewProposal.Field()
    new_selectItem = NewSelectItem.Field()
#    all_board = graphene.List(BoardModelType)
