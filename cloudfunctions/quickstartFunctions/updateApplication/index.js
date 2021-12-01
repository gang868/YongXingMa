const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 修改数据库信息云函数入口函数
exports.main = async (event, context) => {
  try {
    await db.collection('application').doc(event.data.__id).update({
      data: event.data,
      success: function (res) {
        console.log(res);
      }
    })
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};