const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 创建集合云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('application').add({
      data: event.data,
      success: function(res){
        return {
          success: true,
          data: res
        }
      }
    });
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};