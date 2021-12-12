// 后台管理员反馈管理页面
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

  /**
   * 对申请进行反馈
   * @param {*} e 
   */
  feedbackApplication:function(e) {
    var that = this;
    wx.showModal({ // 先抽个皮筋，弹个框框
      title: '确认反馈结果',
      content: that.data.feedbackStatusList[that.data.feedbackStatusIndex] + '，' + that.data.feedbackMemo,
      success(res) {
        if (res.confirm) { // 确认了，就反馈了
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'updateApplication',
              id: that.data.applicationInfo._id,
              data: {
                status: parseInt(that.data.applicationInfo.status) + 1 + parseInt(that.data.feedbackStatusIndex), //原值为2，成功为3，不成功为4
                feedbackMemo: that.data.feedbackMemo // 反馈备注，为懒人准备了默认值，最多就是选一下，点一下的事
              }
            }
          }).then((resp) => {
            console.log(resp);
            wx.switchTab({ // 起初，我用了navigateTo，但错了，就改了
              url: '/pages/index/index'
            });
          });
        }
      }
    })
  },

  /**
   * 标准的回退
   */
  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  /**
   * 为懒人准备的默认反馈备注
   * @param {*} e 
   */
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

  /**
   * 万一有比较勤快的，也给准备了
   * @param {*} e 
   */
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