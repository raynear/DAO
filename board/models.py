from django.db import models

# Create your models here.


class BoardModel(models.Model):
    name = models.CharField(max_length=20, blank=True)
    description = models.CharField(max_length=200, blank=False, default="디폴트")

    def __str__(self):
        return self.name


class ArticleModel(models.Model):
    board = models.ForeignKey(BoardModel, on_delete=models.CASCADE)
    subject = models.CharField(max_length=50, blank=True)
#    name = models.ForeignKey(UserModel)
    contents = models.TextField(default="")
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    view_cnt = models.IntegerField(null=True, blank=False, default=0)

    def __str__(self):
        return self.subject


class CommentModel(models.Model):
    article = models.ForeignKey(ArticleModel, on_delete=models.CASCADE)
    comment = models.CharField(max_length=300, blank=False)
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.comment


class ThumbModel(models.Model):
    article = models.ForeignKey(ArticleModel, on_delete=models.CASCADE)
    comment = models.ForeignKey(CommentModel, on_delete=models.CASCADE)
    create_date = models.DateTimeField(auto_now_add=True)
    up = models.IntegerField(null=False, blank=True)
    down = models.IntegerField(null=False, blank=True)

    def __str__(self):
        return str(self.up)
