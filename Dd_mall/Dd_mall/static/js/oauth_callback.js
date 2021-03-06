let vm = new Vue({
	el: '#app',
    delimiters: ['[[', ']]'],
	data: {
		mobile: '',
		password: '',
		image_code: '',
		sms_code: '',

		error_mobile: false,
		error_password: false,
		error_image_code: false,
		error_sms_code: false,

		error_mobile_message: '',
		error_image_code_message: '',
		error_sms_code_message: '',

		uuid: '',
		image_code_url: '',
		sms_code_tip: '获取短信验证码',
		sms_flag: false,
	},
	mounted(){
		// 生成图形验证码
		this.generate_image_code();
	},
	methods: {
		// 生成图形验证码
		generate_image_code(){
			this.uuid = generateUUID();
			this.image_code_url = "/image_codes/" + this.uuid + "/";
		},
		// 检查手机号
		check_mobile(){
			let re = /^1[3-9]\d{9}$/;
			if(re.test(this.mobile)) {
				this.error_mobile = false;
			} else {
				this.error_mobile_message = '您输入的手机号格式不正确';
				this.error_mobile = true;
			}
		},
		// 检查密码
		check_password(){
			let re = /^[0-9A-Za-z]{8,20}$/;
			if (re.test(this.password)) {
				this.error_password = false;
			} else {
				this.error_password = true;
			}
		},
		// 检查图片验证码
		check_image_code(){
			if(!this.image_code) {
				this.error_image_code_message = '请填写图片验证码';
				this.error_image_code = true;
			} else {
				this.error_image_code = false;
			}
		},
		// 检查短信验证码
		check_sms_code(){
			if(!this.sms_code){
				this.error_sms_code_message = '请填写短信验证码';
				this.error_sms_code = true;
			} else {
				this.error_sms_code = false;
			}
		},
		// 发送短信验证码
		send_sms_code(){
        let url = '/sms_codes/' + this.mobile + '/?image_code=' + this.image_code + '&UUID=' + this.uuid;
            if (this.sms_flag) {
                return;
            }
            this.check_image_code();
            this.check_mobile();
            if (this.error_image_code == true || this.error_mobile == true) {
                this.sms_flag = false;
                return;
            }
            this.sms_flag = true;
            axios.get(url, {responseType: 'json'})
                .then(response => {
                    if (response.data.code == '0') {
                        let num = 60;
                        let t = setInterval(() => {
                            if (num > 1) {
                                num = num - 1;
                                this.sms_code_tip = num + '秒';
                            } else {
                                clearInterval(t);
                                //this.generate_image_code();
                                this.sms_code_tip = '获取短信验证码';
                                this.sms_flag = false;
                            }
                        }, 1000);
                    }
                    if (response.data.code == '4001' || response.data.code == '4002') {
                        this.error_image_code_message = response.data.errmsg;
                        this.error_image_code = true;
                        this.sms_flag = false;
                    }
                    if (response.data.code == '4004') {
                        this.error_mobile_message = response.data.errmsg;
                        this.error_mobile = true;
                        this.sms_flag = false;
                    }

                })
                .catch(error => {
                    console.log(error.response);
                })
        },
		// 绑定openid
		on_submit(){
			this.check_mobile();
			this.check_password();
			this.check_sms_code();

			if(this.error_mobile == true || this.error_password == true || this.error_sms_code == true) {
				// 不满足条件：禁用表单
				window.event.returnValue = false
			}
		}
	}
});