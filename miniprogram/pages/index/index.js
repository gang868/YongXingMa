// index.js
const app = getApp()

Page({
  data: {
    hasActiveApplication: true,
    applicationList: []
  },

  onLoad: function (options) {
    this.getOpenId();

    this.setData({
      statusDesc: app.globalData.statusDesc
    });
  },

  onShow: function (options) {
    this.getApplictionList();
  },

  /**
   * 获取微信用户openid
   */
  getOpenId: function () {
    wx.showLoading({
      title: '读取用户信息',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      console.log('初次加载获取的openid:', resp.result.openid);
      this.setData({
        openid: resp.result.openid
      });
      wx.setStorageSync('openid', resp.result.openid)
    });
    wx.hideLoading();
  },

  /**
   * 根据用户openid读取用户申请记录
   * @param {用户openid}} e 
   */
  getApplictionList: function () {
    var openid = wx.getStorageSync('openid');
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
      that.setData({
        applicationList: resp.result.data
      });
      /**
       * 由于数据加载比较慢，下面代码如果直接放在onload函数中，将会在数据加载前访问applicationList，导致取不到任何数据
       */
      that.data.applicationList.forEach(function (item, index) {
        console.log(item);
        if (item.status < 2) {
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