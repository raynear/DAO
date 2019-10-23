from django.shortcuts import render

# Create your views here.


def kakao(request, template='test.html'):
    #    if request.user.is_authenticated:
    #        social = request.user.social_auth.get(provider="google-oauth2")
    #        extra_data = social.extra_data
    #        print(extra_data)
    #        social = request.user.social_auth.get(provider="kakao")
    #        extra_data = social.extra_data
    #        print(extra_data)
    return render(request, template, {})
