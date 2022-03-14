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

        //v_show
        error_name: false,
        error_password1: false,
        error_password2: false,
        error_phone_num: false,
        error_allow: false,

        //error_message
        error_name_message: '',
        error_password1_message: '',
        error_password2_message: '',
        error_phone_num_message: '',

    },

    methods: {
        check_username() {
            //用户名是5-20个字符，[a-zA-Z0-9_-]
            let re = /^[a-zA-Z0-9_-]{5,20}$/;
            if (this.username == '') {
                this.error_name_message = '用户名不能为空';
                this.error_name = true;
                return;
            }
            if (re.test(this.username)) {
                this.error_name = false;
            } else {
                this.error_name_message = '请输入5-20个字符的用户名';
                this.error_name = true;
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
            if(this.phone_num==''){
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
                alert(this.phone_num);
                this.error_phone_num_message = '手机号位数不正确';
                this.error_phone_num = true;
            }
        },
        check_allow() {
            if(!this.allow){
                this.error_allow=true;
            }else{
                this.error_allow=false;
            }

        },
        on_submit() {
            this.check_username();
            this.check_password1();
            this.check_password2();
            this.check_phone_num();
            this.check_allow();
            if(this.error_name==true||this.error_password1==true||this.error_password2==true||this.error_phone_num==true||this.error_allow==true){
                window.event.returnValue=false;
            }

        }
    }
});