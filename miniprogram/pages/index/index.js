// index.js
const app = getApp()
Page({
  data: {
    showSearchFormat: false,
    isApplicant: true, // 默认为前台申请模式
    hasGotUserData: false, // 是否已经获取用户申请数据
    hasActiveApplication: true, // 是否存在活动申请
    applicationList: [], // 用户所有申请列表
    currentCaseStatus: 2,
    searchShowed: false,
    searchVal: '',
    searchFormat: {
      c1: ['姓名', '证件号', '联系方式', '地址'],
      c2: ['姓名+证件号', '姓名+联系方式', '姓名+地址'],
      c3: ['姓名+证件号+地址', '姓名+联系方式+地址']
    },
    searchFormatMatched: [],
  },

  selectHistory: function (e) {
    var conditions = this.data.searchVal.split(/\s+/);
    if (conditions[conditions.length - 1] == '') {
      conditions.pop();
    }

    var formats = e.currentTarget.dataset.value.split('+');
    if (formats[formats.length - 1] == '') {
      formats.pop();
    }
    var i = 0,
      sv = '';
    formats.forEach(fmt => {
      sv = sv + fmt + ':' + conditions[i] + ' ';
      i++;
    });

    this.setData({
      searchVal: sv,
    });

    this.searchConfirm();
  },

  searchConfirm: function () {
    var that = this;
    var searchVal = this.data.searchVal;
    this.setData({
      searchVal: ''
    });

    var searchValPairs = searchVal.split(/\s+/);
    if (searchValPairs[searchValPairs.length - 1] == '') {
      searchValPairs.pop();
    }

    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        'type': 'searchApplication',
        'searchConditions': searchValPairs
      }
    }).then((resp)=>{
      if (resp.result) {
        wx.setStorageSync('applicationList', resp.result.data);
        that.setData({
          applicationList: resp.result.data
        });
      }
    });
  },

  showSearch: function () {
    this.setData({
      searchShowed: true
    });
  },

  hideSearch: function () {
    this.setData({
      searchVal: "",
      searchShowed: false
    });
  },

  clearSearch: function () {
    this.setData({
      searchVal: ""
    });
  },

  searchTyping: function (e) {
    var sv = e.detail.value;
    var conditions = sv.split(/\s+/);
    if (conditions[conditions.length - 1] == '') {
      conditions.pop();
    }

    switch (conditions.length) {
      case 0:
        this.setData({
          searchFormatMatched: []
        });
        break;
      case 1:
        this.setData({
          searchFormatMatched: this.data.searchFormat.c1
        });
        break;
      case 2:
        this.setData({
          searchFormatMatched: this.data.searchFormat.c2
        });
        break;
      case 3:
        this.setData({
          searchFormatMatched: this.data.searchFormat.c3
        });
      default:
        this.setData({
          searchFormatMatched: this.data.searchFormat.c3
        });
        break;
    }
    this.setData({
      searchVal: e.detail.value
    });
  },

  onLoad: function (options) {
    // 获取用户openid，这是确认不同用户的依据
    this.getOpenId();
    // 五种状态的文字描述
    this.setData({
      statusDesc: app.globalData.statusDesc
    });
  },

  onShow: function (options) {
    // 页面重新显示时，将用户数据获取标志重置
    this.setData({
      hasGotUserData: false
    });
    // 重新获取申请列表
    if (this.data.openid) {
      if (this.data.isApplicant) {
        this.getApplictionList(this.data.openid);
      } else {
        this.getCaseList();
      }
    }
  },

  /**
   * 获取微信用户openid
   */
  getOpenId: function () {
    var that = this;
    wx.showLoading({
      title: '读取用户信息',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      wx.setStorageSync('openid', resp.result.openid);
      // 尝试获取后台操作员令牌
      that.getOperatorToken(resp.result.openid);
      that.setData({
        openid: resp.result.openid
      });
    });
    wx.hideLoading();
  },

  getOperatorToken: function (openid) {
    var that = this;
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOperatorTokenByOpenid',
        openid: openid
      }
    }).then((resp) => {
      // 如果获取成功，则进入后台操作模式，否则进入前台申请模式
      if (resp.result.data.length > 0) {
        wx.setStorageSync('operatorInfo', resp.result.data[0]);
        wx.setTabBarItem({
          index: 0,
          text: '待处理',
          iconPath: '/images/cases_on.png',
          selectedIconPath: '/images/cases_on_red.png'
        });
        that.setData({
          isApplicant: false
        });
        wx.setStorageSync('isApplicant', false);
        that.getCaseList();
      } else {
        that.setData({
          isApplicant: true
        });
        wx.setStorageSync('isApplicant', true);
        that.getApplictionList(openid);
      }
    });
  },

  getCaseList: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'selectApplicationByStatus',
        status: that.data.currentCaseStatus
      }
    }).then((resp) => {
      // console.log(resp);
      if (resp.result) {
        wx.setStorageSync('applicationList', resp.result.data);
        that.setData({
          applicationList: resp.result.data
        });
      }
    });
  },

  /**
   * 根据用户openid读取用户申请记录
   * @param {用户openid}} e 
   */
  getApplictionList: function (openid) {
    var that = this;
    this.setData({
      hasActiveApplication: false
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'selectApplicationByOpenid',
        openid: openid
      }
    }).then((resp) => {
      // 原先代码在获取openid后，再加载用户的申请记录，但是在申请记录读取成功之前，hasActiveApplication为false，就会显示新申请的功能
      // 导致在现有申请未完结的情况下，用户可以再开启另一个申请，hasGotUserData这个变量保证在用户数据未完全获取之前，不显示操作功能
      that.setData({
        applicationList: resp.result.data,
        hasGotUserData: true
      });
      /**
       * 由于数据加载比较慢，下面代码如果直接放在onload函数中，将会在数据加载前访问applicationList，导致取不到任何数据
       */
      that.data.applicationList.forEach(function (item, index) {
        if (item.status <= 2) {
          that.setData({
            hasActiveApplication: true
          });
        }
      });
    });
  },

  /**
   * 获取用户信息，但小程序目前不登记用户信息，该函数并未使用
   * @param {*} e 
   */
  getUserInfo: function (e) {
    const that = this;
    wx.getUserProfile({
      desc: '确认申请人微信信息',
      success(res) {
        // console.log(res.userInfo);
        wx.setStorageSync('userInfo', res.userInfo);
        that.setData({
          userInfo: res.userInfo
        });
      }
    })
  },

  /**
   * 查看被选中申请的信息
   * @param {*} e 
   */
  viewApplicationInfo(e) {
    const index = e.currentTarget.dataset.index;
    var applictionInfo = this.data.applicationList[index];
    wx.setStorageSync('applicationInfo', applictionInfo);
    const data = JSON.stringify(applictionInfo);
    wx.navigateTo({
      url: '/pages/info/index'
    });
  },

  /**
   * 发起一个新的申请，初始化一个空白申请后直接进入输入页面
   */
  apply: function () {
    wx.setStorageSync('applicationInfo', {
      'openid': wx.getStorageSync('openid'),
      'idKind': '身份证',
      'codeColor': '黄码',
      'reason': '发热门诊就诊',
      'date': this.getDateStr(),
      'status': 0,
      'materials': [],
    });
    wx.navigateTo({
      url: '/pages/input/index',
    })
  },

  /**
   * 获取指定格式的日期字符串
   */
  getDateStr: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var ms = m < 10 ? '0' + m : m;
    var d = date.getDate();
    var ds = d < 10 ? '0' + d : d;
    return y + '/' + ms + '/' + ds;
  },

  onPullDownRefresh: function (e) {
    wx.showNavigationBarLoading();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    }, 3000);
  }
});