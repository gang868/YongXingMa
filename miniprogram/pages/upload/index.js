// pages/upload/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    fileLinks: [],
    hasImage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      applicationInfo: JSON.parse(options.data),
    })
  },

  clearImages: function (e) {
    this.setData({
      files: [],
      hasImage: false
    })
  },

  chooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          files: that.data.files.concat(res.tempFilePaths),
          hasImage: true
        });
      }
    })
  },

  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id,
      urls: this.data.files,
    })
  },

  uploadImages: function (e) {
    wx.showLoading({
      title: '正在上传资料....',
    });
    var i = 1,
      successCount = 0;
    var that = this;
    this.setData({
      'applicationInfo.materials': []
    });
    this.data.files.forEach(img => {
      /**获取扩展名（不转换成小写云端居然不能预览） */
      var ext = img.substring(img.lastIndexOf('.')).toLowerCase();
      wx.cloud.uploadFile({
        cloudPath: this.data.id + '_' + String(i) + ext,
        filePath: img,
        success: res => {
          that.setData({
            'applicationInfo.materials': that.data.applicationInfo.materials.concat(res.fileID)
          });
          wx.cloud.getTempFileURL({
            fileList: [res.fileID],
            success: res => {
              that.setData({
                fileLinks: that.data.fileLinks.concat(res.fileList[0].tempFileURL)
              });
            }
          })
        }
      });
      i++;
    });
    wx.hideLoading();
    console.log(this.data.applicationInfo.materials);
    wx.cloud.getTempFileURL({
      fileList: this.data.applicationInfo.materials,
      success: res => {
        console.log(res);
      }
    });
  }
})