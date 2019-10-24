from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.


class BoardModel(models.Model):
    name = models.CharField(max_length=20, blank=True)
    description = models.CharField(max_length=200, blank=False, default="디폴트")

    def __str__(self):
        return self.name


class ProposalModel(models.Model):
    author = models.ForeignKey(
        get_user_model(), related_name='proposals', on_delete=models.SET_NULL, null=True, blank=True, default=get_user_model())
    board = models.ForeignKey(BoardModel, on_delete=models.CASCADE)
    subject = models.CharField(max_length=50, blank=True)
    txHash = models.CharField(max_length=300, blank=True)
    contents = models.TextField(default="")
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    expire_at = models.DateTimeField()

    def __str__(self):
        return self.subject


class SelectItemModel(models.Model):
    index = models.IntegerField(default=0)
    proposal = models.ForeignKey(ProposalModel, on_delete=models.CASCADE)
    contents = models.TextField(default="")

    def __str__(self):
        return self.contents


class VoteModel(models.Model):
    author = models.ForeignKey(
        get_user_model(), related_name='votes', on_delete=models.SET_NULL, null=True, blank=True, default=get_user_model())
    select = models.ForeignKey(SelectItemModel, on_delete=models.CASCADE)
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    txHash = models.CharField(max_length=300, blank=False)

    def __str__(self):
        return self.txHash
