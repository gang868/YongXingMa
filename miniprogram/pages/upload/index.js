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
    var i = 1;
    var that = this;
    // 清除云端文件
    wx.cloud.deleteFile({
      fileList: that.data.applicationInfo.materials
    });
    // 重置客户端变量
    this.setData({
      'applicationInfo.materials': [],
      fileLinks: []
    });

    /**
     * 递归调用解决文件列表依次上传问题
     * @param {图片数组}} img_array 
     */
    function uploadImagesOneByOne(img_array, index) {
      // 提取文件数组第一个文件
      var img = img_array[0];
      // 获取第一个文件扩展名
      var ext = img.substring(img.lastIndexOf('.')).toLowerCase();
      wx.showLoading({
        title: '正在上传第' + index + '张图片...',
      });
      // 如果数组剩余个数为1，完成最后一个图片上传后，更新云端数据库记录，获取云端图片访问链接
      var cloudFilename = that.data.applicationInfo._id + '_' + String(index) + ext;
      if (img_array.length == 1) {
        wx.cloud.uploadFile({
          cloudPath: cloudFilename,
          filePath: img,
          success: res => {
            wx.hideLoading();
            // 图片上传成功后操作
            that.setData({
              'applicationInfo.materials': that.data.applicationInfo.materials.concat(res.fileID)
            });
            // 更新云端数据库记录
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
            // 获取云端图片访问链接
            wx.cloud.getTempFileURL({
              fileList: that.data.applicationInfo.materials,
              success: res => {
                that.setData({
                  fileLinks: res.fileList
                });
              }
            });
            // 清空上传列表
            that.setData({
              files: []
            });
          }
        });
      } else {
        // 去除第一个图的切片操作
        var new_array = img_array.slice(1, img_array.length);
        // 上传第一个图片
        wx.cloud.uploadFile({
          cloudPath: cloudFilename,
          filePath: img,
          success: res => {
            // 图片上传成功后操作
            that.setData({
              'applicationInfo.materials': that.data.applicationInfo.materials.concat(res.fileID)
            });
            // 上传成功后，将切除第一个图片的剩余数组递归调用上传
            wx.hideLoading();
            uploadImagesOneByOne(new_array, index + 1);
          }
        });
      }
    }

    uploadImagesOneByOne(this.data.files, 1);

    wx.hideLoading();
  },

  submitApplication: function () {
    const data = JSON.stringify(this.data.applicationInfo);
    wx.navigateTo({
      url: '/pages/submit/index?data=' + data,
    });
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