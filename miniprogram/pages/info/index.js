// pages/info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileLinks: []
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  submitApplication: function () {
    const data = JSON.stringify(this.data.applicationInfo);
    wx.navigateTo({
      url: '/pages/submit/index?data=' + data,
    });
  },

  modApplication: function (e) {
    const data = JSON.stringify(this.data.applicationInfo);
    wx.navigateTo({
      url: '/pages/input/index?data=' + data,
    });
  },

  modMaterials: function (e) {
    const data = JSON.stringify(this.data.applicationInfo)
    wx.navigateTo({
      url: '/pages/upload/index?data=' + data,
    })
  },

  delApplication: function (e) {
    var that = this;
    wx.showModal({
      title: '确认',
      content: '删除申请？',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'deleteApplication',
              id: that.data.applicationInfo._id
            }
          }).then((resp) => {
            wx.cloud.deleteFile({
              fileList: that.data.applicationInfo.materials
            });
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

    var that = this;
    wx.cloud.getTempFileURL({
      fileList: that.data.applicationInfo.materials,
      success: res => {
        res.fileList.forEach(item => {
          that.setData({
            fileLinks: that.data.fileLinks.concat(item.tempFileURL)
          });
        });
      }
    });
  },

  /**
   * 点击放大察看图片
   * @param {*} e 
   */
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id,
      urls: this.data.fileLinks
    })
  },

  recallApplication: function () {
    var that = this;
    wx.showModal({
      title: '确认',
      content: '撤回申请？',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'updateApplication',
              id: that.data.applicationInfo._id,
              data: {
                status: 1
              }
            },
          }).then((resp) => {
            that.setData({
              'applicationInfo.status': 1
            });
          });
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})