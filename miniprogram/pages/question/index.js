// pages/question/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    saved: true,
    isNew: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = wx.getStorageSync('questionInfo');
    var descLength = data.desc.length;
    this.setData({
      data: data,
      descLength: descLength
    });
  },

  descInput: function (e) {
    var desc = e.detail.value;
    this.setData({
      'data.desc': desc,
      descLength: desc.length,
      saved: false
    });
  },

  titleInput: function (e) {
    this.setData({
      'data.title': e.detail.value,
      saved: false
    });
  },

  sourceInput: function (e) {
    this.setData({
      'data.source': e.detail.value,
      saved: false
    });
  },

  bindDateChange: function (e) {
    this.setData({
      'data.date': e.detail.value,
      saved: false
    })
  },

  saveQuestion: function () {
    var that = this;
    if (that.data.data.title == '') return;
    if (that.data.data.desc == '') return;
    if (that.data.data.source == '') return;
    if (!this.data.saved) {
      if (this.data.data.isNew) {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'createQuestion',
            data: {
              title: that.data.data.title,
              desc: that.data.data.desc,
              source: that.data.data.source,
              date: that.data.data.date
            }
          }
        }).then((resp) => {
          that.setData({
            saved: true,
            isNew: false
          });
          wx.switchTab({
            url: '/pages/about/index',
          })
        });
      } else {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'updateQuestion',
            id: that.data.data._id,
            data: {
              title: that.data.data.title,
              desc: that.data.data.desc,
              source: that.data.data.source,
              date: that.data.data.date
            }
          }
        }).then((resp) => {
          that.setData({
            saved: true
          });
          wx.switchTab({
            url: '/pages/about/index',
          })
        });
      }
    }
  },

  newQuestion: function () {
    this.setData({
      'data.title': '',
      'data.desc': '',
      'data.source': '',
      'data.date': this.getDateStr(),
      descLength: 0,
      saved: false,
      isNew: true
    });
  },

  getDateStr: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var ms = m < 10 ? '0' + m : m;
    var d = date.getDate();
    var ds = d < 10 ? '0' + d : d;
    return y + '-' + ms + '-' + ds;
  },
})