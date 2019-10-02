from django.urls import path

from . import views

urlpatterns = [
    path('kakao/', views.kakao, name='kakao login'),
]
