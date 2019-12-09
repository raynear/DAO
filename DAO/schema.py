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
from board.icon_network import LOCAL_NET, SCORE_ADDRESS

NETWORK = LOCAL_NET

class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class Query(board.schema.Query, graphene.ObjectType):
    viewer = graphene.Field(UserType)

    def resolve_viewer(self, info, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception('Authentication credentials were not provided')
        return user

    me = graphene.Field(UserType)

    def resolve_me(self, info, **kwargs):
        user = info.context.user
        if user.is_anonymous:
            return None
        return user


class SetUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserType)

    def mutate(self, info, username, password):
        try:
            user = get_user_model().objects.get(username=username, password=password)
        except get_user_model().DoesNotExist:
            user = get_user_model().objects.create(username=username)
            user.set_password(password)
            user.save()

        return SetUser(user=user)


class Logout(graphene.Mutation):
    noop = graphene.Field(graphene.Boolean)

    def mutate(self, info):
        pass


class Mutation(board.schema.MyMutation, graphene.ObjectType):
    # social_auth = graphql_social_auth.SocialAuthJWT.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    social_auth = graphql_social_auth.SocialAuth.Field()
    set_user = SetUser.Field()
    logout = Logout.Field()
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
