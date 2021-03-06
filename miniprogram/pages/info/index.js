// pages/info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileLinks: []
  },

  onLoad: function(options) {
    // 增加后台管理后，修订无isApplicant变量导致功能按钮不显示的BUG
    this.setData({
      isApplicant: wx.getStorageSync('isApplicant')
    });
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  /**
   * 提交申请
   */
  submitApplication: function () {
    wx.navigateTo({
      url: '/pages/submit/index'
    });
  },

  /**
   * 修改申请基本信息
   */
  modApplication: function () {
    wx.navigateTo({
      url: '/pages/input/index'
    });
  },

  /**
   * 上传资料
   */
  modMaterials: function () {
    wx.navigateTo({
      url: '/pages/upload/index'
    })
  },

  /**
   * 删除申请
   */
  delApplication: function () {
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
              wx.removeStorageSync('applicationInfo');
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          });
        }
      }
    })
  },

  onShow: function (options) {
    this.setData({
      applicationInfo: wx.getStorageSync('applicationInfo'),
      statusDesc: app.globalData.statusDesc
    });
  },

  previewImage: function (e) {
    var src = e.currentTarget.dataset.src;
    var list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: src,
      urls: list
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
            wx.setStorageSync('applicationInfo', that.data.applicationInfo);
          });
        }
      }
    });
  },

  gotoIndex:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  feedbackCase: function(){
    wx.navigateTo({
      url: '/pages/feedback/index',
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})