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


class Mutation(object):
    all_board = graphene.List(BoardModelType)
