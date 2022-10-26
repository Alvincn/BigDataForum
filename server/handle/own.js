// 发送邮箱验证码配置
//引入模块
const nodemailer = require('nodemailer');

let sendMails = (mailId, VerificationCode) => {
  //设置邮箱配置
  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', //邮箱服务的主机，如smtp.qq.com
    service: 'qq',
    port: '465', //对应的端口号QQ邮箱的端口号是465
    secure: false, //开启安全连接
    //secureConnection:false,   //是否使用ssl
    auth: {
      //用户信息
      user: 'alvin0423@qq.com', //用来发邮件的邮箱账户
      pass: 'gppdhnvuiykfdagc', //这里的密码是qq的smtp授权码，可以去qq邮箱后台开通查看
    },
  });

  //设置收件人信息
  let mailOptions = {
    from: 'alvin0423@qq.com', //谁发的
    to: mailId, //发给谁
    subject: '大数据论坛', //主题是什么
    text: `您好，你的登录验证码为：${VerificationCode}
此验证码仅用于登录大数据论坛后台，请不要随意将验证码发给他人`, //文本内容
    html: '', //html模板
    // attachments: [              //附件信息,如果需要了再打开使用
    //     {
    //         filename: '',
    //         path: '',
    //     }
    // ]
  };

  return new Promise((resolve, reject) => {
    //异步函数
    //发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error); //错误
      } else {
        resolve(info);
        // console.log(`信息id   Message: ${info.messageId}`);
        // console.log(`成功响应 sent: ${info.response}`);
        // console.log(`邮件信息 mailOptions: ${JSON.stringify(mailOptions)}`);
      }
    });
  });
};

// export default sendMails  暴露出去
module.exports = {
  sendMails,
};
