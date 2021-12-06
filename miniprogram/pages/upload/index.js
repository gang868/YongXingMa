// pages/upload/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    hasImage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('upload', options);
    this.setData({
      id: options.id
    })
  },

  clearImages: function(e) {
    this.setData({
      files: [],
      hasImage: false
    })
  },

  chooseImage: function(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          files:that.data.files.concat(res.tempFilePaths),
          hasImage: true
        });
      }
    })
  },

  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id,
      urls: this.data.files,
    })
  }
})