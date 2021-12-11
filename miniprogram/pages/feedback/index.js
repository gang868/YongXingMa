// pages/feedback/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idKindList: ['身份证', '护照'],
    codeColorList: ['黄码', '红码'],
    reasonList: ['发热门诊就诊', '其它'],
    feedbackStatusList: ['已改码', '改码不成功'],
    feedbackStatusIndex: 0,
    feedbackMemo: '申请提交成功'
  },

  feedbackApplication:function(e) {
    var that = this;
    wx.showModal({
      title: '确认反馈结果',
      content: that.data.feedbackStatusList[that.data.feedbackStatusIndex] + '，' + that.data.feedbackMemo,
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'updateApplication',
              id: that.data.applicationInfo._id,
              data: {
                status: parseInt(that.data.applicationInfo.status) + 1 + parseInt(that.data.feedbackStatusIndex),
                feedbackMemo: that.data.feedbackMemo
              }
            }
          }).then((resp) => {
            console.log(resp);
            wx.switchTab({
              url: '/pages/index/index'
            });
          });
        }
      }
    })
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  feedbackStatusChange:function(e) {
    if(e.detail.value==1) {
      this.setData({
        feedbackMemo: '系统禁止纠码'
      });
    } else {
      this.setData({
        feedbackMemo: '申请提交成功'
      });
    }
    this.setData({
      feedbackStatusIndex: e.detail.value,
    });
  },

  feedbackMemoInput:function(e){
    this.setData({
      feedbackMemo: e.detail.value,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      applicationInfo: wx.getStorageSync('applicationInfo')
    });
  },

})