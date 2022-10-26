const db = require('../db/index');
class User {
  constructor() {}
  findUser(email) {
    return new Promise((resolve, reject) => {
      db.query('select * from users where email=?', email, (err, result) => {
        if (err) return resolve({ code: 301, msg: '数据库错误' });
        if (result.length == 0) return resolve({ code: 404, msg: 'User 未找到' });
        return resolve({ data: result, msg: '用户查找成功' });
      });
    });
  }
}
