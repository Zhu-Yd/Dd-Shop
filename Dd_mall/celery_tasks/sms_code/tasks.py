from .sms.rly_sms_SDK.sendSms import CCP
from .sms import constants
from celery_tasks.main import celery_app


@celery_app.task(name='send_sms_code')
def send_sms_code(mobile, sms_code):
    send_result = CCP().send_message(constants.SEND_SMS_TEMPLATE_ID, mobile,
                                     (sms_code, constants.SMS_CODE_REDIS_EXPIRES // 60))
    return send_result
