// pages/info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  modApplication: function (e) {
    const data = JSON.stringify(this.data.applicationInfo);
    wx.navigateTo({
      url: '/pages/input/index?data=' + data,
    });
  },

  modEvidence: function(e) {
    wx.navigateTo({
      url: '/pages/upload/index?id='+this.data.applicationInfo._id,
    })
  },

  delApplication: function (e) {
    var that = this;
    wx.showModal({
      title: '确认',
      content: '删除申请',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'deleteApplication',
              id: that.data.applicationInfo._id
            }
          }).then((resp) => {
            console.log('Delete application:', resp);
            if (resp.errMsg == 'cloud.callFunction:ok') {
              wx.navigateBack();
            }
          });
        }
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      applicationInfo: JSON.parse(options.data),
      statusDesc: app.globalData.statusDesc
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})