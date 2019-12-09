from django.db.models import Q
import graphene
from graphql import GraphQLError
from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import superuser_required, staff_member_required, login_required

from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

import json

from account.models import User

from .models import ProposalModel, SelectItemModel, VoteModel

from .icon_network import TEST_NET, LOCAL_NET, SCORE_ADDRESS
NETWORK = TEST_NET


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

    prep = graphene.Field(CustomUserType, prep_id=graphene.Int())

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

    def resolve_prep(self, info, prep_id=None, **kwargs):
        return CustomUserType.objects.get(pk=prep_id)

    def resolve_proposal(self, info, id=None, **kwargs):
        if id == -1:
            return None
        # raise GraphQLError('No Proposal')

        return ProposalModel.objects.get(pk=id)

    def resolve_proposals(self, info, prep=None, search=None, first=None, skip=None, **kwargs):
        qs = ProposalModel.objects.all()

        print(prep)
        if (prep != None) & (prep != "All") & (prep != ""):
            aPRep = CustomUserType.objects.get(username=prep)
            filter = Q(prep__exact=aPRep.id)
            qs = qs.filter(filter)

        if search:
            filter = (Q(subject__icontains=search) | Q(contents__icontains=search)) & (
                Q(author__exact=info.context.user) | Q(publish__exact=True))
            qs = qs.filter(filter)
        if skip:
            qs = qs[skip:]
        if first:
            qs = qs[:first]

        return qs

    def resolve_all_prep(self, info, **kwargs):
        qs = CustomUserType.objects.all()
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
    def mutate(self, info, proposal_id):
        proposal = ProposalModel.objects.get(pk=proposal_id)
        proposal.published = True

        icon_service = IconService(HTTPProvider(NETWORK, 3))
        print(SCORE_ADDRESS)
        print(info.context.user.username)

        call = CallBuilder()\
            .to(SCORE_ADDRESS)\
            .method("GetVerifyInfoByID")\
            .params({"_ID": info.context.user.username})\
            .build()

        result = icon_service.call(call)
        console.log(result)
        result_json = json.loads(result)
        console.log(result_json)

        if result_json['confirmed']:
            selectItems = SelectItemModel.objects.filter(proposal=proposal)
            _select_item = '['
            for idx, item in enumerate(selectItems):
                _select_item += "\""+item.contents+"\""
                if idx < len(selectItems)-1:
                    _select_item += ','
            _select_item += ']'

            f = open("key.pw", 'r')
            line = f.readline()
            wallet = KeyWallet.load(
                "./key_store_raynear", line)

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
        prep_id = graphene.Int()
        published = graphene.Boolean()
        expire_at = graphene.DateTime()
        quorum_rate = graphene.Int()
        token_rate = graphene.Int()
        select_item_list = graphene.List(SelectItemInput)

    proposal = graphene.Field(ProposalModelType)

    def mutate(
        self,
        info,
        proposal_id,
        subject,
        contents,
        published,
        quorum_rate,
        token_rate,
        prep_id,
        expire_at,
        select_item_list,
    ):
        selectedPRep = CustomUserType.objects.get(id=prep_id)
        try:
            proposal = ProposalModel.objects.get(pk=proposal_id)
        except ProposalModel.DoesNotExist:
            proposal = ProposalModel.objects.create(
                author=info.context.user,
                subject=subject,
                contents=contents,
                published=published,
                quorum_rate=quorum_rate,
                token_rate=token_rate,
                prep=selectedPRep,
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
            proposal.quorum_rate = quorum_rate
            proposal.token_rate = token_rate
            proposal.prep = selectedPRep
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
