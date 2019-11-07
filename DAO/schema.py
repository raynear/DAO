from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import graphene
import graphql_jwt
from graphql_jwt.decorators import login_required
import graphql_social_auth
from graphene_django import DjangoObjectType

import board.schema


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class Query(board.schema.Query, graphene.ObjectType):
    me = graphene.Field(UserType)
    users = graphene.List(UserType)
    get_user = graphene.Field(
        UserType, username=graphene.String(), password=graphene.String()
    )

    viewer = graphene.Field(UserType, token=graphene.String(required=True))

    @login_required
    def resolve_viewer(self, info, **kwargs):
        return info.context.user

    def resolve_get_user(self, info, username, password):
        user = authenticate(username=username, password=password)
        if user is not None:
            return user
        else:
            return None

    def resolve_users(self, info, **kwargs):
        return get_user_model().objects.all()

    def resolve_me(self, info, **kwargs):
        if not info.context.user.is_authenticated:
            return None
        else:
            return info.context.user

    pass


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


class Mutation(board.schema.MyMutation, graphene.ObjectType):
    # social_auth = graphql_social_auth.SocialAuthJWT.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    social_auth = graphql_social_auth.SocialAuth.Field()
    set_user = SetUser.Field()
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
