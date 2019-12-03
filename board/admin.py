from django.contrib import admin
from .models import PRepModel, ProposalModel, SelectItemModel, VoteModel

admin.site.register(PRepModel)
admin.site.register(ProposalModel)
admin.site.register(SelectItemModel)
admin.site.register(VoteModel)

# Register your models here.
