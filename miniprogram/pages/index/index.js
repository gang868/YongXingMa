// index.js
const app = getApp()
Page({
  data: {
    showSearchFormat: false,
    isApplicant: true, // 是否是前台申请者标志，默认为真，前台申请模式。假则为后台操作员模式
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

  /**
   * 搜索栏中输入内容后，选择查询格式
   * @param {*} e 
   */
  selectFormat: function (e) {
    var conditions = this.data.searchVal.split(/\s+/); // 对要搜索内容按空格分离成数组，如："张三 133 花园"分离成['张三', '133', '花园']
    if (conditions[conditions.length - 1] == '') {
      conditions.pop(); // 搜索内容最后一个字符为空格时，分离的数据最后一个元素是''，剔除这个元素
    }

    var formats = e.currentTarget.dataset.value.split('+'); // 格式字符串是用加号，用split分离
    if (formats[formats.length - 1] == '') {
      formats.pop(); // 其实这一步没必要
    }
    var i = 0,
      sv = '';
    formats.forEach(fmt => {
      sv = sv + fmt + ':' + conditions[i] + ' '; // 按格式依次组合成'姓名:李四 联系方式:133 地址:花园'
      i++;
    });

    this.setData({
      searchVal: sv, // 将组合成的查询字符串代替原来的搜索内容
    });

    this.searchConfirm(); // 选择格式等同于确认搜索
  },

  /**
   * 在搜索栏中回车或在输入法中点击搜索触发
   */
  searchConfirm: function () {
    var searchVal = this.data.searchVal; // 先将搜索字符串留底
    this.hideSearch(); // 然后隐藏搜索（搜索字符串会被清空）
    var that = this;

    var searchValPairs = searchVal.split(/\s+/); // 对'姓名:李四 联系方式:133 地址:花园'或'李 王'等格式拆分
    if (searchValPairs[searchValPairs.length - 1] == '') {
      searchValPairs.pop(); // 这一步正常没必要
    }

    wx.cloud.callFunction({ // 召唤查询云函数，在云函数中，会将查询字符串解析进行指定查询
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

  /**
   * 搜索栏focus触发
   */
  showSearch: function () {
    this.setData({
      searchShowed: true
    });
  },

  /**
   * 点击搜索栏取消触发
   */
  hideSearch: function () {
    this.setData({
      searchVal: "",
      searchShowed: false
    });
  },

  /**
   * 清理搜索内容
   */
  clearSearch: function () {
    this.setData({
      searchVal: ""
    });
  },

  /**
   * 搜索栏中输入内容触发
   * @param {*} e 
   */
  searchTyping: function (e) {
    var sv = e.detail.value; // 取得内容
    var conditions = sv.split(/\s+/); // 按空格分离成数组
    if (conditions[conditions.length - 1] == '') {
      conditions.pop(); // 剔除最后元素
    }

    switch (conditions.length) { // 根据分离出来的数组长度，在搜索栏下方显示搜索格式选项
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

  /**
   * 获取操作员令牌，如果有，则进入后台操作员的页面模式，如果无，则进入前台申请改码模式
   * @param {*} openid 
   */
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
      url: '/pages/declare/index',
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
  }
});