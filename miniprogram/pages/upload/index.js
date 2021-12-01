// pages/upload/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempFilePaths: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('upload', options);
    var kindStr = '核酸检测报告';
    if(options.kind == 'travel') {
      kindStr = '通信行程卡'
    }
    this.setData({
      uploadKind: options.kind,
      uploadKindStr: kindStr
    })
  },

  chooseimage: function(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          tempFilePaths:res.tempFilePaths
        });
      }
    })
  }
})