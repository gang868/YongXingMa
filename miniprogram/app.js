// app.js
App({
  onLaunch: function () {
    const that = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'yongxingma-8g7no2eobf874a18',
        traceUser: true,
      });
    }

    this.globalData = {
      statusDesc: ['材料待上传', '申请待提交','提交待改码', '已改码','改码不成功'],
    };
  }
});