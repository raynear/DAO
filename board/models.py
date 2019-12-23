from django.db import models
from django.contrib.auth import get_user_model
from account.models import User
import enum

#user = get_user_model()
user = User


class Status(enum.Enum):
    NOT_PUBLISHED = 0
    VOTING = 1
    HAS_WINNER = 2
    NO_WINNER = 3


class ProposalModel(models.Model):
    prep = models.ForeignKey(
        user,
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        default=user
    )
    status = models.IntegerField(default=0)
    published = models.BooleanField(default=False)
    prep_pid = models.IntegerField(default=0)
    subject = models.CharField(max_length=50, blank=True)
    txHash = models.CharField(max_length=300, blank=True)
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


class VoteModel(models.Model):
    voter = models.ForeignKey(
        user,
        related_name="votes",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=user,
    )
    select = models.ForeignKey(SelectItemModel, on_delete=models.CASCADE)
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    txHash = models.CharField(max_length=300, blank=False)

    def __str__(self):
        return self.txHash
