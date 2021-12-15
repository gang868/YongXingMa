// pages/declare/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canApply: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      canApply: false
    });
  },

  agreeClause: function (options) {
    if (this.data.canApply) {
      this.setData({
        canApply: false
      });
    } else {
      this.setData({
        canApply: true
      });
    }
  },

  gotoApply: function(){
    if(this.data.canApply) {
      this.setData({
        canApply: false
      });
      wx.redirectTo({
        url: '/pages/input/index',
      });
    }
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  }
})