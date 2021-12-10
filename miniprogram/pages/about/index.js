// pages/about/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isApplicant: true,
    questionList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getQuestion'
      }
    }).then((resp) => {
      resp.result.data.forEach(item => {
        var dateStr = that.getDateStr(item.date);
        item.dateStr = dateStr;
        // console.log(item, dateStr);
      });
      that.setData({
        questionList: resp.result.data
      });
    });

    try {
      this.setData({
        operatorInfo: wx.getStorageSync('operatorInfo'),
        isApplicant: false
      });
    } catch (e) {
      console('operatorInfo: ', e);
    }
  },

  iAmTaped: function (e) {
    const index = e.currentTarget.dataset.index;
    var item = this.data.questionList[index];
    if (this.data.isApplicant) {
      wx.showModal({
        title: item.title,
        content: item.desc,
        showCancel: false
      });
    } else {
      wx.setStorageSync('questionInfo', item)
      wx.navigateTo({
        url: '/pages/question/index',
      })
    }
  },
  /**
   * 获取指定格式的日期字符串
   */
  getDateStr: function (date) {
    var timestamp = Date.parse(date);
    var date = new Date(timestamp);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var ms = m < 10 ? '0' + m : m;
    var d = date.getDate();
    var ds = d < 10 ? '0' + d : d;
    return y + '/' + ms + '/' + ds;
  },
})