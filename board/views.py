from django.shortcuts import render

# Create your views here.


def kakao(request, template='test.html'):
    return render(request, template, {})
