// pages/submit/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canSubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      applicationInfo: wx.getStorageSync('applicationInfo')
    });

    if (this.data.applicationInfo.status == 1) {
      this.setData({
        canSubmit: true
      });
    }
  },

  submitApplication: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'updateApplication',
        id: that.data.applicationInfo._id,
        data: {
          status: 2
        }
      },
    }).then((resp) => {
      that.setData({
        canSubmit: false,
        'applicationInfo.status': 2
      });
      wx.setStorageSync('applicationInfo', that.data.applicationInfo);
      wx.redirectTo({
        url: '/pages/info/index',
      });
    });
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  }
})