from django.db import models
from django.contrib.auth import get_user_model
from account.models import User
import enum

#user = get_user_model()
user = User


class ProposalModel(models.Model):
    prep = models.ForeignKey(
        user,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        default=user
    )
    status = models.CharField(max_length=300, blank=True, default="")
    isPublicVote = models.BooleanField(default=False)
    published = models.BooleanField(default=False)
    prep_pid = models.IntegerField(default=0)
    subject = models.CharField(max_length=50, blank=True)
    txHash = models.CharField(max_length=300, blank=True)
    finalizeTxHash = models.CharField(max_length=300, blank=True, default="")
    contents = models.TextField(default="")
    electoral_th = models.IntegerField(default=0)
    winning_th = models.IntegerField(default=0)
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    expire_at = models.DateTimeField()

    def __str__(self):
        return self.subject


class SelectItemModel(models.Model):
    proposal = models.ForeignKey(ProposalModel, on_delete=models.CASCADE)
    index = models.IntegerField(default=0)
    contents = models.TextField(default="")

    def __str__(self):
        return self.contents


class TxModel(models.Model):
    txHash = models.CharField(max_length=300, blank=False)

    def __str__(self):
        return self.txHash
