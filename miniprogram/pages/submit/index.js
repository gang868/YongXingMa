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
      applicationInfo: JSON.parse(options.data)
    });

    if (this.onAddToFavorites.applicationInfo.status == 1) {
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
        canSubmit: false
      });
      wx.navigateTo({
        url: '/pages/index/index',
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})