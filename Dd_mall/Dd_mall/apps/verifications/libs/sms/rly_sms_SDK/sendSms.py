from Dd_mall.apps.verifications.libs.sms.rly_sms_SDK.rly_sms import SmsSDK
from Dd_mall.apps.verifications import constants



class CCP(object):
    """发送短信单例类"""

    def __new__(cls, *args, **kwargs):
        if not hasattr(cls, '_instance'):
            cls._instance = super(CCP, cls).__new__(cls, *args, **kwargs)
            cls._instance.sdk = SmsSDK(constants.accId, constants.accToken, constants.appId)

        return cls._instance

    def send_message(self, tid, mobile, datas):
        resp = self.sdk.sendMessage(tid, mobile, datas)
        print(resp)
        if eval(resp).get('statusCode') == '000000':
            return 0
        else:
            return -1


if __name__ == '__main__':
    CCP().send_message('1', '18616528797', ('999999', 5))
