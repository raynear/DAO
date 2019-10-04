from django.contrib import admin
from .models import BoardModel, ProposalModel, SelectItemModel, VoteModel

admin.site.register(BoardModel)
admin.site.register(ProposalModel)
admin.site.register(SelectItemModel)
admin.site.register(VoteModel)

# Register your models here.
