from django.urls import re_path
from . import views

urlpatterns = [
    # 图形验证码
    re_path(r'^image_codes/(?P<uuid>[\w-]+)/$', views.ImageCodeView.as_view()),
    # 短信验证码
    re_path(r'^sms_codes/(?P<mobile>1[1-9]\d{9})/$', views.SmsCodeView.as_view()),

]
