from django.shortcuts import render, redirect
from django.views import View
from django.conf import settings
from QQLoginTool.QQtool import OAuthQQ
from django import http
from Dd_mall.utils.response_code import RETCODE, err_msg
import logging, re
from django.contrib.auth import login
from django.urls import reverse
from django_redis import get_redis_connection
from django.core import signing

from Dd_mall.apps.oauth.models import OAuthQQUser
from Dd_mall.apps.oauth import constants
from Dd_mall.apps.users.models import User

logger = logging.getLogger('django')


# Create your views here.
class QQOauthCallbackView(View):
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return http.HttpResponseForbidden()
        try:
            oauth = OAuthQQ(settings.QQ_CLIENT_ID, settings.QQ_CLIENT_SECRET, settings.QQ_REDIRECT_URI)
            access_token = oauth.get_access_token(code)
            open_id = oauth.get_open_id(access_token)
        except Exception as e:
            logger.error(e)
            return http.HttpResponseServerError('OAuth2.0认证失败')

        try:
            oauth_user = OAuthQQUser.objects.get(openid=open_id)
        except OAuthQQUser.DoesNotExist:
            signer = signing.TimestampSigner(salt='QQ_OAUTH')
            access_token_openid = signer.sign_object({'open_id': open_id})
            cotext = {'access_token_openid': access_token_openid}
            return render(request, 'oauth_callback.html', cotext)
        else:
            login(request, oauth_user.user)
            next = request.GET.get('state')
            response = redirect(next)
            response.set_cookie('username', oauth_user.user.username, constants.USERNAME_EXPIRES)
            return response

    def post(self, request):
        mobile = request.POST.get('mobile')
        password = request.POST.get('password')
        sms_code = request.POST.get('sms_code')
        access_token_openid = request.POST.get('access_token_openid')

        if not all([password, mobile, sms_code, access_token_openid]):
            return http.HttpResponseForbidden('缺少参数')

        if not re.match(r'^[a-zA-Z0-9]{8,20}$', password):
            return http.HttpResponseForbidden('密码不合法')

        if not re.match(r'^1[3-9]\d{9}$', mobile):
            return http.HttpResponseForbidden('手机号码不合法')

        redis_coon = get_redis_connection('verify_code')
        sms_code_server = redis_coon.get('sms_%s' % mobile)
        if sms_code_server is None:
            return render(request, 'oauth_callback.html', {'sms_code_errmsg': '短信验证码已失效'})

        if not (sms_code.lower() == sms_code.lower()):
            return render(request, 'oauth_callback.html', {'sms_code_errmsg': '短信验证码输入有误'})

        signer = signing.TimestampSigner(salt='QQ_OAUTH')
        openid = signer.unsign_object(access_token_openid, max_age=constants.ACCESS_TOKEN_EXPIRES).get('open_id')

        if not openid:
            return render(request, 'oauth_callback.html', {'openid_errmsg': 'openid已失效'})

        # 判断手机号是否绑定用户，如果未绑定，新建用户，并将用户名设置为手机号+'_'
        # 存在两种异常情况，手机号已绑定用户（验证密码|密码找回），用户名已存在（提示异常信息）
        # 注册时用户名不能为纯数字，因用户名重复绑定qq失败概率极小
        try:
            user = User.objects.get(mobile=mobile)
        except User.DoesNotExist:
            user = User.objects.create_user(username=mobile + '_', password=password, mobile=mobile)
        else:
            if not user.check_password(password):
                return render(request, 'oauth_callback.html', {'account_errmsg': '密码错误'})
        try:
            oauth_user = OAuthQQUser.objects.create(user=user, openid=openid)
        except Exception as e:
            logger.error(e)
            return render(request, 'oauth_callback.html', {'account_errmsg': 'QQ用户绑定失败'})

        login(request, oauth_user.user)
        next = request.GET.get('state')
        response = redirect(next)
        response.set_cookie('username', oauth_user.user.username, constants.USERNAME_EXPIRES)
        return response


class QQLoginView(View):
    def get(self, request):
        next = request.GET.get('next')
        try:
            oauth = OAuthQQ(settings.QQ_CLIENT_ID, settings.QQ_CLIENT_SECRET, settings.QQ_REDIRECT_URI, next)
            login_url = oauth.get_qq_url()
        except Exception as e:
            logger.error(e)
        return http.JsonResponse({'code': RETCODE.OK, 'errmsg': err_msg.get(RETCODE.OK), 'login_url': login_url})
