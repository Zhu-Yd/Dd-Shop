from django.urls import re_path
from . import views
urlpatterns = [
    # 用户注册
    re_path(r'^register/$', views.RegisterView.as_view(), name='register'),
    # 校验用户名是否存在
    re_path(r'^usernames/(?P<username>[a-zA-Z0-9_-]{5,20})/count/$', views.CheckUsernameRepeatView.as_view()),
    # 校验手机号是否存在
    re_path(r'^mobile/(?P<num>[0-9]{11})/count/$', views.CheckMobileRepeatView.as_view()),
]
