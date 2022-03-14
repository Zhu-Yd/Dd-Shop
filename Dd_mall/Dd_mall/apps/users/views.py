from django.shortcuts import render
from django import http
import re

# Create your views here.
from django.views import View


class RegisterView(View):
    """用户注册"""

    def get(self, request):
        """提供用户注册页面"""
        return render(request, 'register.html')

    def post(self, request):
        """实现用户注册业务逻辑"""
        username = request.POST.get('username')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        mobile = request.POST.get('mobile')
        allow = request.POST.get('allow')

        if not all([username, password1, password2, mobile, allow]):
            return http.HttpResponseForbidden('缺少参数')

        if not re.match(r'^[a-zA-Z0-9_-]{5,20}$', username):
            return http.HttpResponseForbidden('用户名不合法')

        if not re.match(r'^[a-zA-Z0-9]{8,20}$', password1):
            return http.HttpResponseForbidden('密码不合法')

        if password1 != password2:
            return http.HttpResponseForbidden('两次输入密码不一致')

        if not re.match(r'^1[3-9]\d{9}$', mobile):
            return http.HttpResponseForbidden('手机号码不合法')

        if allow != 'on':
            return http.HttpResponseForbidden('请勾选用户协议')
