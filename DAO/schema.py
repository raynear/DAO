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


class AskVerify(graphene.Mutation):
    noop = graphene.Field(graphene.Boolean)

    class Arguments:
        target_address = graphene.String()

    @login_required
    def mutate(self, info, target_address):
        icon_service = IconService(HTTPProvider(NETWORK, 3))
        wallet = KeyWallet.load(
            "./key_store_raynear", "ekdrms1!")

        call = CallBuilder()\
            .to(SCORE_ADDRESS)\
            .method("GetVerifyInfoByAddress")\
            .params({"_Address": target_address})\
            .build()

        result = icon_service.call(call)
        result_json = json.loads(result)

        a_block = icon_service.get_block(result_json['blockheight'])
        if result_json['blockhash'] == '0x'+a_block['block_hash']:
            transaction = CallTransactionBuilder()\
                .from_(wallet.get_address())\
                .to(SCORE_ADDRESS)\
                .step_limit(10000000)\
                .nid(3)\
                .method("ConfirmVerify")\
                .params({"_TargetAddress": target_address})\
                .build()

            signed_transaction = SignedTransaction(transaction, wallet)
            tx_hash = icon_service.send_transaction(signed_transaction)

            info.context.user.icon_auth = True
            info.context.user.icon_address = target_address
            info.context.user.save()


class Mutation(board.schema.MyMutation, graphene.ObjectType):
    # social_auth = graphql_social_auth.SocialAuthJWT.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    social_auth = graphql_social_auth.SocialAuth.Field()
    set_user = SetUser.Field()
    logout = Logout.Field()

    ask_verify = AskVerify.Field()
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
