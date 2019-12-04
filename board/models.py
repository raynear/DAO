from django.db import models
from django.contrib.auth import get_user_model
from account.models import User

user = get_user_model()
user = User

# Create your models here.


class PRepModel(models.Model):
    name = models.CharField(max_length=20, blank=True)
    prep_address = models.CharField(max_length=60, blank=True)
    description = models.CharField(max_length=200, blank=False, default="디폴트")

    def __str__(self):
        return self.name


class ProposalModel(models.Model):
    author = models.ForeignKey(
        user,
        related_name="proposals",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=user,
    )
    prep = models.ForeignKey(PRepModel, on_delete=models.CASCADE, default=None)
    published = models.BooleanField(default=False)
    subject = models.CharField(max_length=50, blank=True)
    proposal_id = models.IntegerField(default=0, blank=True)
    txHash = models.CharField(max_length=300, blank=True)
    contents = models.TextField(default="")
    quorum_rate = models.IntegerField(default=0)
    token_rate = models.IntegerField(default=0)
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
