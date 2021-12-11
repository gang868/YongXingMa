const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  var conditions = [];
  event.searchConditions.forEach(item => {
    var pairs = item.split(':');
    if (pairs.length == 1) {
      conditions = conditions.concat({
        name: db.RegExp({
          regexp: '.*' + pairs[0] + '.*',
          options: 'i'
        })
      });
    } else {
      if (pairs.length >= 2) {
        switch (pairs[0]) {
          case '姓名':
            conditions = conditions.concat({
              name: db.RegExp({
                regexp: '.*' + pairs[1] + '.*',
                options: 'i'
              })
            });
            break;
          case '证件号':
            conditions = conditions.concat({
              id: db.RegExp({
                regexp: '.*' + pairs[1] + '.*',
                options: 'i'
              })
            });
            break;
          case '联系方式':
            conditions = conditions.concat({
              contact: db.RegExp({
                regexp: '.*' + pairs[1] + '.*',
                options: 'i'
              })
            });
            break;
          case '地址':
            conditions = conditions.concat({
              address: db.RegExp({
                regexp: '.*' + pairs[1] + '.*',
                options: 'i'
              })
            });
            break;
        }
      }
    }
  });
  console.log(conditions);
  // 返回数据库查询结果
  return await db.collection('application').where(_.or(conditions)).get();
};