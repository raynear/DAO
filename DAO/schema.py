from django.contrib.auth import get_user_model
import graphene
import graphql_social_auth
from graphene_django import DjangoObjectType
import board.schema


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class Query(board.schema.Query, graphene.ObjectType):

    me = graphene.Field(UserType)
    users = graphene.List(UserType)

    def resolve_users(self, info, **kwargs):
        return get_user_model().objects.all()

    def resolve_me(self, info, **kwargs):
        print(info.context.user.social_auth)
        if not info.context.user.is_authenticated:
            return None
        else:
            return info.context.user
    pass


class Mutation(board.schema.MyMutation, graphene.ObjectType):
    social_auth = graphql_social_auth.SocialAuthJWT.Field()
    # social_auth = graphql_social_auth.SocialAuth.Field()
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
