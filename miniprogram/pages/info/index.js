// pages/info/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  modApplicationInfo: function (e) {
    const data = JSON.stringify(this.data.applicationInfo);
    wx.navigateTo({
      url: '/pages/input/index?data=' + data,
    });
  },

  delApplication:function(){

  },

  onLoad: function (options) {
    this.setData({
      applicationInfo: JSON.parse(options.data)
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})