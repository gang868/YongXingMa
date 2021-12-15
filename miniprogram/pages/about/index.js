// pages/about/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isApplicant: true,
    showMe: false,
    questionList: []
  },

  onLoad: function(options) {
    this.setData({
      isApplicant: wx.getStorageSync('isApplicant')
    });
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
  },

  iAmTaped: function (e) {
    const index = e.currentTarget.dataset.index;
    var item = this.data.questionList[index];
    if (this.data.isApplicant) {
      this.setData({
        showMe: true,
        showTitle: item.title,
        showDesc: item.desc
      })
    } else {
      wx.setStorageSync('questionInfo', item)
      wx.navigateTo({
        url: '/pages/question/index',
      })
    }
  },

  closeShowMe: function(){
    this.setData({
      showMe: false
    })
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