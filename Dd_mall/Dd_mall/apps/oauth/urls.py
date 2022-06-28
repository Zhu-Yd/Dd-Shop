from django.urls import re_path
from . import views

urlpatterns = [
    # QQ登录扫码页面
    re_path(r'^qq/login/$', views.QQLoginView.as_view()),
    # QQ登录扫码回调
    re_path(r'^oauth_callback.html/$', views.QQOauthCallbackView.as_view()),


]
