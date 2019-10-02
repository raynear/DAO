from django.contrib import admin
from .models import BoardModel, ArticleModel, CommentModel, ThumbModel

admin.site.register(BoardModel)
admin.site.register(ArticleModel)
admin.site.register(CommentModel)
admin.site.register(ThumbModel)

# Register your models here.
