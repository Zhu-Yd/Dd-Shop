from django.shortcuts import render
from django.views import View
from django_redis import get_redis_connection
from django import http
import logging, random

from Dd_mall.apps.verifications.libs.captcha.captcha import captcha
from . import constants
from Dd_mall.utils.response_code import RETCODE, err_msg
from celery_tasks.sms_code.tasks import send_sms_code
from .libs.sms.rly_sms_SDK.sendSms import CCP

logger = logging.getLogger('django')


# Create your views here.
class SmsCodeView(View):
    def get(self, request, mobile):
        image_code_client = request.GET.get('image_code')
        uuid = request.GET.get('UUID')

        if not all([image_code_client, uuid]):
            return http.HttpResponseForbidden('参数错误')
        redis_conn = get_redis_connection('verify_code')

        if redis_conn.get('r_%s' % mobile):
            return http.JsonResponse({'code': RETCODE.USERERR, 'errmsg': '手机号已存在'})

        if redis_conn.get('sms_flag_%s' % mobile):
            return http.JsonResponse({'code': RETCODE.THROTTLINGERR, 'errmsg': err_msg.get(RETCODE.THROTTLINGERR)})

        image_code_server = redis_conn.get('img_%s' % uuid)
        if image_code_server is None:
            return http.JsonResponse({'code': RETCODE.IMAGECODEERR, 'errmsg': '图形验证码失效'})
        redis_conn.delete('img_%s' % uuid)
        if image_code_server.decode().lower() != image_code_client.lower():
            return http.JsonResponse({'code': RETCODE.IMAGECODEERR, 'errmsg': '图形验证码输入有误'})

        sms_code = '%06d' % random.randint(0, 999999)
        logger.info('sms_' + mobile + ':' + sms_code)
        redis_conn.setex('sms_flag_%s' % mobile, constants.SEND_SMS_CODE_INTERVAL, '1')
        redis_conn.setex('sms_%s' % mobile, constants.SMS_CODE_REDIS_EXPIRES, sms_code)
        # CCP().send_message(constants.SEND_SMS_TEMPLATE_ID, mobile, (sms_code, constants.SMS_CODE_REDIS_EXPIRES // 60))
        send_sms_code.delay(mobile, sms_code)
        return http.JsonResponse({'code': RETCODE.OK, 'errmsg': 'null'})


class ImageCodeView(View):
    """图形验证码"""

    def get(self, request, uuid):
        text, image = captcha.generate_captcha()
        redis_conn = get_redis_connection('verify_code')
        redis_conn.setex('img_%s' % uuid, constants.IMAGE_CODE_REDIS_EXPIRES, text)
        return http.HttpResponse(image, content_type='image/jpg')
