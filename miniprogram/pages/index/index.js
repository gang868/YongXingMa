// index.js
const app = getApp()

Page({
  data: {
    hasGotUserData: false,
    hasActiveApplication: true,
    applicationList: []
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
    this.setData({
      hasGotUserData: false
    });
    this.getApplictionList(this.data.openid);
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
      that.getApplictionList(resp.result.openid);
      this.setData({
        openid: resp.result.openid
      });
    });
    wx.hideLoading();
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

  getUserInfo: function (e) {
    const that = this;
    wx.getUserProfile({
      desc: '确认申请人微信信息',
      success(res) {
        console.log(res.userInfo);
        wx.setStorageSync('userInfo', res.userInfo);
        that.setData({
          userInfo: res.userInfo
        });
      }
    })
  },
  /*
  查看被选中申请的信息
  */
  viewApplicationInfo(e) {
    const index = e.currentTarget.dataset.index;
    const data = JSON.stringify(this.data.applicationList[index]);
    wx.navigateTo({
      url: '/pages/info/index?data=' + data,
    });
  },

  apply: function () {
    wx.navigateTo({
      url: '/pages/input/index',
    })
  },

  onPullDownRefresh: function (e) {
    wx.showNavigationBarLoading();
    setTimeout(()=>{
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    }, 3000);
  }
});