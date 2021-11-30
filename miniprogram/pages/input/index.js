// pages/input/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idIndex: 0,
    idKindList: ['身份证', '护照'],
    idInputType: 'idcard',
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
          idIndex: 1,
          idInputType: 'text'
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
    } else {
      this.setData({
        applicationInfo: {
          '_id': 0,
          'openid': wx.getStorageSync('openid'),
          'idKind': '身份证',
          'codeColor': '黄码',
          'reason': '发热门诊就诊'
        }
      })
    }

    this.setData({
      openid: wx.getStorageSync('openid')
    });
  },

  /*
   * 证件类型改变事件
   */
  idKindChange: function (e) {
    var idInputTypeList = ['idcard', 'text'];
    this.setData({
      idIndex: e.detail.value,
      idInputType: idInputTypeList[e.detail.value],
      'applicationInfo.idKind': this.data.idKindList[e.detail.value]
    });
  },

  /*
   * 码颜色改变事件
   */
  codeColorChange: function (e) {
    this.setData({
      codeIndex: e.detail.value,
      'applicationInfo.codeColor': this.data.codeColorList[e.detail.value]
    });
  },

  /*
   * 变码原因改变事件
   */
  reasonChange: function (e) {
    this.setData({
      reasonIndex: e.detail.value,
      'applicationInfo.reason': this.data.reasonList[e.detail.value]
    });
  },

  /*
   * 输入姓名
   */
  nameInput: function (e) {
    this.setData({
      'applicationInfo.name': e.detail.value
    });
  },

  /**
   * 输入联系方式
   */
  contactInput: function (e) {
    this.setData({
      'applicationInfo.contact': e.detail.value
    });
  },

  /**
   * 输入证件号码
   */
  idInput: function (e) {
    this.setData({
      'applicationInfo.id': e.detail.value
    });
  },

  /**
   * 输入家庭住址
   */
  addressInput: function (e) {
    this.setData({
      'applicationInfo.address': e.detail.value
    });
  },

  /**
   * 
   */
  saveAndUpload: function () {

  }
})