new Vue({
  el: '#app',
  data() {
    return {
      captcha: {},
      emailcode: '',
      imgcaptcha: '',
      email: '',
      islogin: false,
    };
  },
  created() {
    axios
      .get('http://www.ivikey.top:3009/getCaptcha')
      .then((res) => {
        this.captcha = res.data.captcha;
        document.querySelector('#captcha').innerHTML = this.captcha.data;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    getCode() {
      if (this.email == '') return this.$toast.fail('邮箱不能为空');
      const eamilreg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
      if (this.imgcaptcha == this.captcha.text) {
        if (eamilreg.test(this.email)) {
          this.islogin = true;
          var result = new URLSearchParams();
          result.append('email', this.email);
          axios
            .post('http://www.ivikey.top:3009/getcode', result)
            .then((res) => {
              return this.$toast.success('验证码发送成功');
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          this.islogin = false;
          return this.$toast.success('邮箱格式不正确，请输入正确的邮箱');
        }
      } else {
        this.$toast.fail('图形验证码错误');
      }
    },
    login() {
      if (this.emailcode == '') {
        return this.$toast.fail('邮箱验证码不能为空');
      }
      var result = new URLSearchParams();
      result.append('email', this.email);
      axios
        .post('http://www.ivikey.top:3009/userexist', result)
        .then((res) => {
          console.log(res.data);
          if (res.data.code == 200) {
            var text = new URLSearchParams();
            text.append('email', this.email);
            text.append('emailcode', this.emailcode);
            axios
              .post('http://www.ivikey.top:3009/codelogin', text)
              .then((res) => {
                console.log(res);
                if (res.data.code == 200) {
                  localStorage.setItem('email', this.email);

                  this.$toast.success(res.data.msg);
                  window.location = './view/index.html';
                } else if (res.data.code == 302) {
                  this.$toast.fail(res.data.msg);
                } else {
                  this.$toast.fail('您还不是大数据的成员呢，去论坛向我们提问把');
                }
              })
              .catch((err) => {
                this.$toast.fail('未知错误' + err);
                return console.log(err);
              });
          } else if (res.data.code == 404) {
            return this.$toast.fail('您还不是大数据的成员呢，去论坛向我们提问把');
          } else {
            return this.$toast.fail('未知错误，请联系管理员');
          }
        })
        .catch((err) => {
          return this.$toast.fail('未知错误，请联系管理员');
        });
    },
    changeimg() {
      axios
        .get('http://www.ivikey.top:3009/getCaptcha')
        .then((res) => {
          this.captcha = res.data.captcha;
          document.querySelector('#captcha').innerHTML = this.captcha.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
});
