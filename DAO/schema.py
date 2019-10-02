import graphene
import board.schema


class Query(board.schema.Query, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query)
