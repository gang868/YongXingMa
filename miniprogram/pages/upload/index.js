// pages/upload/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    fileLinks: [],
    hasImage: false,
    resetMaterials: true // 是否取代原图片 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从url传递的数据中解析出申请信息
    this.setData({
      applicationInfo: JSON.parse(options.data),
    });

    var that = this;
    wx.cloud.getTempFileURL({
      fileList: that.data.applicationInfo.materials,
      success: res => {
        res.fileList.forEach(item => {
          that.setData({
            fileLinks: that.data.fileLinks.concat(item.tempFileURL)
          });
        });
      }
    });
  },

  /**
   * 点击重新选择，清空files待上传图片列表
   */
  clearImages: function () {
    this.setData({
      files: [],
      hasImage: false
    })
  },

  /**
   * 从照片中或拍摄获取图片
   */
  chooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
        if (that.data.files.length >= 2) {
          that.setData({
            hasImage: true
          });
        } else {
          that.setData({
            hasImage: false
          });
        }
      }
    })
  },

  /**
   * 点击放大察看图片
   * @param {*} e 
   */
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id,
      urls: this.data.files,
    })
  },

  /**
   * 点击上传图片事件
   */
  uploadImages: function () {
    wx.showLoading({
      title: '正在上传资料....',
    });
    var i = 1;
    var that = this;
    wx.cloud.deleteFile({
      fileList: that.data.applicationInfo.materials
    });
    this.setData({
      'applicationInfo.materials': [],
      fileLinks: []
    });
    this.data.files.forEach(img => {
      /**获取扩展名（不转换成小写云端居然不能预览） */
      var ext = img.substring(img.lastIndexOf('.')).toLowerCase();
      wx.cloud.uploadFile({
        cloudPath: this.data.applicationInfo._id + '_' + String(i) + ext,
        filePath: img,
        success: res => {
          console.log('res.fileId', res.fileID);
          that.setData({
            'applicationInfo.materials': that.data.applicationInfo.materials.concat(res.fileID)
          });

          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'updateApplication',
              id: that.data.applicationInfo._id,
              data: {
                status: 1,
                materials: that.data.applicationInfo.materials
              }
            }
          });

          wx.cloud.getTempFileURL({
            fileList: [res.fileID],
            success: res => {
              console.log('res.fileList', res.fileList);
              that.setData({
                fileLinks: that.data.fileLinks.concat(res.fileList[0].tempFileURL)
              });
            }
          });

          that.setData({
            files: []
          });
        }
      });
      i++;
    });

    wx.hideLoading();
  },

  /**
   * 设置上传模式
   * @param {*} e 
   */
  setUploadMode: function (e) {
    this.setData({
      resetMaterials: e.detail.value
    })
  }
})