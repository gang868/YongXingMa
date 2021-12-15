import WxValidate from '../../utils/WxValidate.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    saved: true,
    needUpload: false,
    idIndex: 0,
    idKindList: ['身份证', '护照'],
    idInputType: 'idcard',
    codeIndex: 0,
    codeColorList: ['黄码', '红码'],
    reasonIndex: 0,
    reasonList: ['发热门诊就诊', '其它'],
    materials: []
  },

  /**
   * 初始化验证函数
   */
  initValidate: function(){
    const rules = {
      name: {
        required: true,
        minlength: 2
      },
      contact: {
        required: true,
        tel: true
      },
      id: {
        required: true,
        minlength: 9
      },
      address: {
        required: true,
        minlength: 4
      }
    };

    const messages = {
      name: {
        required: '请输入姓名',
        minlength: '姓名至少2个字'
      },
      contact: {
        required: '请输入联系方式',
        tel: '请输入13位手机号码'
      },
      id :{
        required: '请输入证件号码',
        minlength: '证件号码不正确'
      },
      address: {
        required: '请输入住址',
        minlength: '地址至少4个字'
      }
    };

    this.WxValidate = new WxValidate(rules, messages);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initValidate();
    this.setData({
      applicationInfo: wx.getStorageSync('applicationInfo'),
    });

    if(this.data.applicationInfo.status==0) {
      this.setData({
        needUpload: true
      });
    }

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
      'applicationInfo.idKind': this.data.idKindList[e.detail.value],
      saved: false
    });
  },

  /*
   * 码颜色改变事件
   */
  codeColorChange: function (e) {
    this.setData({
      codeIndex: e.detail.value,
      'applicationInfo.codeColor': this.data.codeColorList[e.detail.value],
      saved: false
    });
  },

  /*
   * 变码原因改变事件
   */
  reasonChange: function (e) {
    this.setData({
      reasonIndex: e.detail.value,
      'applicationInfo.reason': this.data.reasonList[e.detail.value],
      saved: false
    });
  },

  /*
   * 输入姓名
   */
  nameInput: function (e) {
    this.setData({
      'applicationInfo.name': e.detail.value,
      saved: false
    });
  },

  /**
   * 输入联系方式
   */
  contactInput: function (e) {
    this.setData({
      'applicationInfo.contact': e.detail.value,
      saved: false
    });
  },

  /**
   * 输入证件号码
   */
  idInput: function (e) {
    this.setData({
      'applicationInfo.id': e.detail.value,
      saved: false
    });
  },

  /**
   * 输入家庭住址
   */
  addressInput: function (e) {
    this.setData({
      'applicationInfo.address': e.detail.value,
      saved: false
    });
  },

  submitForm: function(e) {
    const params = e.detail.value;
    if(!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      wx.showModal({
        content: error.msg,
      });
      return false;
    }
    this.saveApplication(e);
  },

  /**
   * 保存申请
   */
  saveApplication: function (e) {
    var that = this;
    wx.showLoading({
      title: '正在保存申请....',
    });
    if (this.data.saved) {
      wx.navigateTo({
        url: '/pages/upload/index'
      });
    } else {
      if (this.data.applicationInfo._id) {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'updateApplication',
            id: that.data.applicationInfo._id,
            data: {
              address: that.data.applicationInfo.address,
              codeColor: that.data.applicationInfo.codeColor,
              contact: that.data.applicationInfo.contact,
              date: that.data.applicationInfo.date,
              id: that.data.applicationInfo.id,
              idKind: that.data.applicationInfo.idKind,
              name: that.data.applicationInfo.name,
              reason: that.data.applicationInfo.reason
            }
          }
        }).then((resp) => {
          wx.setStorageSync('applicationInfo', that.data.applicationInfo);
          that.setData({
            saved: true
          });
          if (that.data.needUpload) {
            wx.navigateTo({
              url: '/pages/upload/index'
            });
          } else {
            wx.navigateBack({
              delta: 1,
            });
          }
        });
      } else {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'createApplication',
            data: this.data.applicationInfo
          }
        }).then((resp) => {
          that.setData({
            saved: true,
            'applicationInfo._id': resp.result._id
          });
          wx.setStorageSync('applicationInfo', this.data.applicationInfo);
          if (that.data.needUpload) {
            wx.navigateTo({
              url: '/pages/upload/index'
            });
          } else {
            wx.navigateBack({
              delta: 1,
            });
          }
        });
      }
    }
    wx.hideLoading();
  },

  goBack: function () {
    wx.navigateBack({
      delta: 0,
    })
  }
})