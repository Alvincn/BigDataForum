const express = require('express');
const router = express.Router();
const db = require('../db/index');
// 引入session
var session = require('express-session');
// 引入发送邮件模块
const { sendMails } = require('../handle/own');
// 格式化时间
const moment = require('moment');
// 引入图片验证码
const svgCaptcha = require('svg-captcha');
// 获取图片验证码设置
function getCaptcha(req, res, next) {
  var captcha = svgCaptcha.createMathExpr({
    // 翻转颜色
    inverse: false,
    // 字体大小
    fontSize: 50,
    // ignoreChars:'0io1I',
    // 噪声线条数
    noise: 2,
    // 宽度
    width: 80,
    // 高度
    height: 40,
    color: true,
    background: 'white',
  });
  return captcha;
}
// 查找数据库
function findUser(email) {
  return new Promise((resolve, reject) => {
    db.query('select * from users where email=?', email, (err, result) => {
      if (err) return reject({ code: 301, msg: '数据库错误' });
      if (result.length == 0) return reject({ code: 404, msg: 'User 未找到' });
      return resolve({ code: 200, data: result, msg: '用户查找成功' });
    });
  }).catch((err) => {
    console.log(err);
  });
}
router.get('/', (req, res) => {
  res.send('你好');
});
// 获取所有问题
router.post('/getquestions', (req, res) => {
  //   res.send('getquestions');
  db.query('select * from questions', (err, result) => {
    if (err) return res.send({ code: 301, msg: '数据库错误' });
    return res.send({
      code: 200,
      msg: '数据查询成功',
      data: result,
    });
  });
});
// 提问
router.post('/addqus', (req, res) => {
  const { username, question } = req.body;
  let time = moment(Date.now()).format('YYYY-MM-DD HH:mm');
  db.query(
    'insert into questions(username,question,time) values(?,?,?)',
    [username, question, time],
    (err, result) => {
      if (err) return res.send({ code: 301, msg: '数据库错误', err: err });
      return res.send({
        code: 200,
        msg: '数据插入成功',
        data: result,
      });
    }
  );
});
// 获取图形验证码
router.get('/getCaptcha', (req, res) => {
  const captcha = getCaptcha(req, res);
  res.send({
    code: 200,
    captcha,
  });
});
/**
 * 获取验证码
 * @parms:email
 * @return {code: "状态码", GoodCode: 验证码}
 */
router.post('/getcode', (req, res) => {
  let mailId = req.body.email; //收件人的邮箱账号
  let VerificationCode = Math.floor(Math.random() * 899999 + 100000); //生成随机码
  global.VerificationCode = VerificationCode;
  console.log('发送的验证码为：' + VerificationCode); //查看随机码
  sendMails(mailId, VerificationCode)
    .then((res) => {
      if (res.response == '250 OK: queued as.') {
        //如果发送成功执行的操作
        console.log('发送成功了，收件人是：' + res.accepted); //是个数组
      } else {
        //发送失败执行的操作
        console.log('发送失败了，错误为：' + res.rejected); //也是个数组
      }
    })
    .catch((err) => {
      console.log('邮箱发送失败：' + err);
    });
  return res.send({
    code: 200,
    goodCode: VerificationCode,
    msg: '邮箱发送成功',
  });
});
// 判断用户是否存在
router.post('/userexist', async (req, res) => {
  const email = req.body.email;
  const user = await findUser(email);
  res.send(user);
});
// 验证码登录
router.post('/codelogin', (req, res) => {
  const emailcode = req.body.emailcode;
  const email = req.body.email;
  if (parseFloat(emailcode) === global.VerificationCode) {
    req.session.email = email;
    res.send({ code: 200, msg: '登录成功' });
  } else {
    res.send({ code: 302, msg: '验证码错误' });
  }
});
// 获取具体问题信息
router.get('/detail', (req, res) => {
  console.log(req.query);
  db.query('select * from questions where id=?', req.query.id, (err, result) => {
    if (err) return res.send({ code: 301, msg: '数据库错误' });
    else res.send({ code: 200, data: result[0], msg: '获取成功' });
  });
});
// 获取问题下的评论区
router.post('/getcomments', (req, res) => {
  const id = req.body.id;
  console.log('获取评论区啦，要获取的评论id为' + id);
  db.query('select * from answers where toid=?', id, (err, result) => {
    if (err) return res.send({ code: 301, msg: '数据库错误' });
    return res.send({ code: 200, data: result });
  });
});

// 添加评论区
router.post('/addcomment', (req, res) => {
  const answer = req.body.answer;
  const toid = req.body.toid;
  const fromwho = req.body.fromwho;
  const fromid = req.body.fromid;
  const username = req.body.username;
  let time = moment(Date.now()).format('YYYY-MM-DD HH:mm');
  console.log(username);
  if (fromid == '') {
    db.query(
      'insert into answers(answer,toid,time,fromwho) values(?,?,?,?)',
      [answer, toid, time, fromwho],
      (err, result) => {
        if (err) return res.send({ code: 301, msg: '数据库错误', err1: err });
        return res.send({ code: 200, msg: '插入成功', data: result });
      }
    );
  } else {
    db.query(
      'insert into answers(answer,toid,time,fromwho,fromid) values(?,?,?,?,?)',
      [answer, toid, time, fromwho, fromid],
      (err, result) => {
        if (err) return res.send({ code: 301, msg: '数据库错误', err2: err });
        return res.send({ code: 200, msg: '插入成功', data: result });
      }
    );
  }
});

// 删除问题
router.post('/deleteque', (req, res) => {
  var id = req.body.id;
  db.query('delete from questions where id=?', id, (err, result) => {
    if (err) return res.send({ code: 301, msg: '数据库错误', err: err });
    db.query('delete from answers where toid=?', id, (err, result) => {
      if (err) return res.send({ code: 301, msg: '数据库错误', err: err });
      else return res.send({ code: 200, msg: '删除成功' });
    });
  });
});
// 添加官方回答
router.post('/addanswer', (req, res) => {
  var id = req.body.id;
  var answer = req.body.answer;
  console.log(id, answer);
  db.query('update questions set answer=? where id=?', [answer, id], (err, result) => {
    if (err) return res.send({ code: 301, msg: '数据库错误', err: err });
    else return res.send({ code: 200, msg: '回答成功' });
  });
});
module.exports = router;
