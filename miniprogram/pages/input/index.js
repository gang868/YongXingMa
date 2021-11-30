// pages/input/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idIndex: 0,
    idKindList: ['身份证', '护照'],
    codeIndex: 0,
    codeColorList: ['黄码', '红码'],
    reasonIndex: 0,
    reasonList: ['发热门诊就诊', '其它'],
    rnaReportSrc: "../../images/picture_light.png",
    travleSrc: "../../images/picture_light.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.data) {
      this.setData({
        applicationInfo: JSON.parse(options.data),
      });

      if (this.data.applicationInfo.idKind == '护照') {
        this.setData({
          idIndex: 1
        });
      }
      if (this.data.applicationInfo.codeColor == '红码') {
        this.setData({
          codeIndex: 1
        });
      }
      if (this.data.applicationInfo.reason == '其它') {
        this.setData({
          reasonIndex: 1
        });
      }
    }
  },

  /*
   * 证件类型改变事件
   */
  idKindChange: function (e) {
    this.setData({
      idIndex: e.detail.value
    });
  },

  /*
   * 码颜色改变事件
   */
  codeColorChange: function (e) {
    this.setData({
      codeIndex: e.detail.value
    });
  },

  /*
   * 变码原因改变事件
   */
  reasonChange: function (e) {
    this.setData({
      reasonIndex: e.detail.value
    });
  },

  /**
   * 
   */
  saveAndUpload: function () {

  }
})