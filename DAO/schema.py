from django.contrib.auth import get_user_model
import graphene
import graphql_social_auth
from graphene_django import DjangoObjectType
import board.schema


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class Query(board.schema.Query, graphene.ObjectType):
    users = graphene.List(UserType)
    print("test")
    print(users)

    def resolver_users(self, info, **kwargs):
        return get_user_model().objects.all()
    pass


class Mutation(board.schema.Mutation, graphene.ObjectType):
    social_auth = graphql_social_auth.SocialAuthJWT.Field()
    print("test")
    print(social_auth)
    #social_auth = graphql_social_auth.SocialAuth.Field()
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
