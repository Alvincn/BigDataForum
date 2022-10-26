const express = require('express');
const app = express();

// 引入跨域请求
const cors = require('cors');
app.use(cors());
// post 请求解析 POST
const bodyParser = require('body-parser');
// 使用中间件
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// 解析Cookie
// 使用cookie-parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// 引入session
var session = require('express-session');
// 对session进行设置
app.use(
  session({
    secret: 'chenshiboyyds',
    name: 'hellouser',
    cookie: {
      maxAge: 86400 * 15,
    },
    resave: true,
    saveUninitialized: false,
  })
);
// 引入路由
const router = require('./routers/index');
app.use(router);

app.listen(3009, () => {
  console.log('server is running at http://www.ivikey.top:3006');
});
