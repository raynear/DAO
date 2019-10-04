from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token

# Create your views here.


def kakao(request, template='test.html'):
    return render(request, template, {})


def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})
