from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from django.contrib.auth import authenticate
import graphene
import graphql_jwt
from graphql_jwt.decorators import login_required
import graphql_social_auth
from graphene_django import DjangoObjectType

from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

import json

import board.schema
from board.icon_network import ICON_NETWORK, SCORE_ADDRESS

NETWORK = ICON_NETWORK


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class Query(board.schema.Query, graphene.ObjectType):
    viewer = graphene.Field(UserType)

    def resolve_viewer(self, info, **kwargs):
        user = info.context.user
#        if not user.is_authenticated:
#            raise Exception('Authentication credentials were not provided')
        return user


class SetUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        new_password = graphene.String(required=False)
        avatar = graphene.String(required=False)

    user = graphene.Field(UserType)

    def mutate(self, info, username, password):  # , new_password, avatar):
        try:
            user = get_user_model().objects.get(username=username, password=password)
#            user.avatar = avatar
#            user.set_password(new_password)
            user.save()
        except get_user_model().DoesNotExist:
            user = get_user_model().objects.create(username=username)
#            user.avatar = avatar
            user.set_password(password)
            user.save()

        return SetUser(user=user)


class Logout(graphene.Mutation):
    noop = graphene.Field(graphene.Boolean)

    def mutate(self, info):
        pass


class Mutation(board.schema.MyMutation, graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    social_auth = graphql_social_auth.SocialAuthJWT.Field()
    set_user = SetUser.Field()
    logout = Logout.Field()
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
