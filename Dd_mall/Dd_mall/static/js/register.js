//创建Vue对象 vm
let vm = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        //v_model
        username: '',
        password1: '',
        password2: '',
        phone_num: '',
        allow: '',
        image_code_url: '',
        uuid: '',
        image_code: '',
        sms_code: '',
        sms_code_tip: '获取短信验证码',
        sms_flag: false,

        //v_show
        error_name: false,
        error_password1: false,
        error_password2: false,
        error_phone_num: false,
        error_allow: false,
        error_image_code: false,
        error_sms_code: false,

        //error_message
        error_name_message: '',
        error_password1_message: '',
        error_password2_message: '',
        error_phone_num_message: '',
        error_image_code_message: '',
        error_sms_code_message: '',

    },
    mounted() {
        this.generate_image_code();
    },
    methods: {
        send_sms_code() {
        let url = '/sms_codes/' + this.phone_num + '/?image_code=' + this.image_code + '&UUID=' + this.uuid;
            if (this.sms_flag) {
                return;
            }
            this.check_image_code();
            this.check_phone_num();
            if (this.error_image_code == true || this.error_phone_num == true) {
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
                        this.error_phone_num_message = response.data.errmsg;
                        this.error_phone_num = true;
                        this.sms_flag = false;
                    }

                })
                .catch(error => {
                    console.log(error.response);
                })
        },
        generate_image_code() {
            this.uuid = generateUUID();
            this.image_code_url = '/image_codes/' + this.uuid + '/';
        },
        check_username() {
            //用户名是5-20个字符，[a-zA-Z0-9_-]
            let re = /^[a-zA-Z0-9_-]{5,20}$/;
            let re2=/^\d+$/
            if (this.username == '') {
                this.error_name_message = '用户名不能为空';
                this.error_name = true;
                return;
            }
            if(re2.test(this.username)){
                this.error_name_message = '用户名不能为纯数字';
                this.error_name = true;
                return;
            }
            if (re.test(this.username)) {
                this.error_name = false;
            } else {
                this.error_name_message = '请输入5-20个字符的用户名';
                this.error_name = true;
            }

            if (this.error_name == false) {
                let url = '/usernames/' + this.username + '/count/';
                axios.get(url, {
                    responseType: 'json'
                })
                    .then(response => {
                        if (response.data.count == 1) {
                            console.log(response)
                            this.error_name_message = '用户名已存在';
                            this.error_name = true;
                        } else {
                            this.error_name = false;
                        }
                    })
                    .catch(error => {
                        console.log(error.response)
                    })

            }

        },
        check_password1() {
            let re = /^[a-zA-Z0-9]{8,20}$/;
            if (this.password1 == '') {
                this.error_password1_message = '密码不能为空';
                this.error_password1 = true;
                return;
            }
            if (re.test(this.password1)) {
                this.error_password1 = false;
            } else {
                this.error_password1_message = '请输入8-20位字母数字组合密码';
                this.error_password1 = true;

            }
        },
        check_password2() {
            if (this.password2 == '') {
                this.error_password2_message = '请再次确认密码';
                this.error_password2 = true;
                return;
            }
            if (this.password1 === this.password2) {
                this.error_password2 = false;
            } else {
                this.error_password2_message = '两次密码输入不一致';
                this.error_password2 = true;
            }
        },
        check_phone_num() {
            let re = /^[0-9]+$/;
            let re2 = /^\d{11}$/;
            if (this.phone_num == '') {
                this.error_phone_num_message = '手机号不能为空';
                this.error_phone_num = true;
                return;
            }
            if (re.test(this.phone_num)) {
                this.error_phone_num = false;
            } else {
                this.error_phone_num_message = '手机号格式不正确';
                this.error_phone_num = true;
                return;
            }
            if (re2.test(this.phone_num)) {
                this.error_phone_num = false;
            } else {
                this.error_phone_num_message = '手机号位数不正确';
                this.error_phone_num = true;
            }

            if (this.error_phone_num == false) {
                let url = '/mobile/' + this.phone_num + '/count/';
                axios.get(url, {
                    responseType: 'json'
                })
                    .then(response => {
                        if (response.data.count == 1) {
                            console.log(response)
                            this.error_phone_num_message = '手机号已存在';
                            this.error_phone_num = true;
                        } else {
                            this.error_phone_num = false;
                        }
                    })
                    .catch(error => {
                        console.log(error.response)
                    })

            }
        },
        check_image_code() {
            if (this.image_code.length != 4) {
                this.error_image_code_message = "请输入图形验证码";
                this.error_image_code = true;
            } else {
                this.error_image_code = false;
            }
        },
        check_allow() {
            if (!this.allow) {
                this.error_allow = true;
            } else {
                this.error_allow = false;
            }

        },
        check_sms_code() {
            let re = /^\d{6}$/;
            if (re.test(this.sms_code)) {
                this.error_sms_code = false;
            } else {
                this.error_sms_code_message = "短信验证码格式有误";
                this.error_sms_code = true;
            }


            this.error_sms_code = false;
        },
        on_submit() {
            this.check_username();
            this.check_password1();
            this.check_password2();
            this.check_phone_num();
            this.check_sms_code();
            this.check_allow();
            if (this.error_name == true || this.error_password1 == true || this.error_password2 == true || this.error_phone_num == true || this.error_sms_code == true || this.error_allow == true) {
                window.event.returnValue = false;
            }

        }
    }
});