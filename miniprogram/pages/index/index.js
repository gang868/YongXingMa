// index.js
Page({
  data: {
    hasActiveApplication: false,
    applicationInfo: {
      applicationList: [{
          _id: 20211128001,
          openid: 'oNyvz4hb2x7eUUh_6f1j5T0Wls_c',
          date: '2021年11月28日',
          status: '已改码',
          name: '张冠李',
          idKind: '护照',
          id: 'NB20171123',
          contact: '1390574XXXX',
          address: '双东路195弄50号305室',
          codeColor: '红码',
          reason: '其它',
          rnaReport: '已上传',
          travel: '已上传'
        }
      ]
    }
  },

  onLoad: function (options) {
    this.data.applicationInfo.applicationList.forEach(element => {
      if (element.status == '待审核') {
        this.setData({
          hasActiveApplication: true
        });
      }
    });
    this.getOpenId();
  },

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
      console.log(resp.result.openid);
      that.setData({
        openid: resp.result.openid
      });
      wx.setStorageSync('openid', resp.result.openid)
    });
    wx.hideLoading();
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

  onClickPowerInfo(e) {
    const index = e.currentTarget.dataset.index;
    const powerList = this.data.powerList;
    powerList[index].showItem = !powerList[index].showItem;
    if (powerList[index].title === '数据库' && !this.data.haveCreateCollection) {
      this.onClickDatabase(powerList);
    } else {
      this.setData({
        powerList
      });
    }
  },

  onChangeShowEnvChoose() {
    wx.showActionSheet({
      itemList: this.data.envList.map(i => i.alias),
      success: (res) => {
        this.onChangeSelectedEnv(res.tapIndex);
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  onChangeSelectedEnv(index) {
    if (this.data.selectedEnv.envId === this.data.envList[index].envId) {
      return;
    }
    const powerList = this.data.powerList;
    powerList.forEach(i => {
      i.showItem = false;
    });
    this.setData({
      selectedEnv: this.data.envList[index],
      powerList,
      haveCreateCollection: false
    });
  },

  /*
  查看被选中申请的信息
  */
  viewApplicationInfo(e) {
    const index = e.currentTarget.dataset.index;
    const data = JSON.stringify(this.data.applicationInfo.applicationList[index]);
    wx.navigateTo({
      url: '/pages/info/index?data=' + data,
    });
  },

  apply: function () {
    wx.navigateTo({
      url: '/pages/input/index',
    })
  },

  onClickDatabase(powerList) {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.selectedEnv.envId
      },
      data: {
        type: 'createCollection'
      }
    }).then((resp) => {
      if (resp.result.success) {
        this.setData({
          haveCreateCollection: true
        });
      }
      this.setData({
        powerList
      });
      wx.hideLoading();
    }).catch((e) => {
      console.log(e);
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  }
});