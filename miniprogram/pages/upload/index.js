// pages/upload/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    hasImage: false,
    uploading: false,
    resetMaterials: true // 是否取代原图片 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从url传递的数据中解析出申请信息
    this.setData({
      applicationInfo: wx.getStorageSync('applicationInfo'),
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
    var src = e.currentTarget.dataset.src;
    var list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: src,
      urls: list
    })
  },

  getuuid: function (len, radix) {
    var chars = '0123456789ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];
    var i = 0;
    radix = radix || chars.length
    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[0 | Math.random() * radix]
      }
    } else {
      var r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
      uuid[14] = '4'
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
        }
      }
    }
    return uuid.join('');
  },

  getTimeId: function (len, radix) {
    if (len) {
      const time = new Date().getTime();
      const uuid = this.getuuid(len, radix);
      return `${time}${uuid}`
    }
  },

  /**
   * 点击上传图片事件
   */
  uploadImages: function () {
    var i = 1;
    var that = this;
    // 清除云端文件
    if (that.data.applicationInfo.materials) {
      wx.cloud.deleteFile({
        fileList: that.data.applicationInfo.materials
      });
    }
    // 重置客户端变量
    this.setData({
      'applicationInfo.materials': [],
      fileLinks: [],
      uploading: true
    });

    /**
     * 递归调用解决文件列表依次上传问题
     * @param {图片数组}} img_array 
     */
    function uploadImagesOneByOne(img_array, i) {
      // 提取文件数组第一个文件
      var img = img_array[0];
      // 获取第一个文件扩展名
      var ext = img.substring(img.lastIndexOf('.')).toLowerCase();
      wx.showLoading({
        title: '正在上传第' + i + '张图片...',
      });
      // 如果数组剩余个数为1，完成最后一个图片上传后，更新云端数据库记录，获取云端图片访问链接
      var cloudFilename = that.getTimeId(8, 12) + ext;
      console.log(cloudFilename);
      if (img_array.length == 1) {
        wx.cloud.uploadFile({
          cloudPath: cloudFilename,
          filePath: img,
          success: res => {
            console.log(i, res);
            // console.log('最后-索引、原图、云名、ID', i, img, cloudFilename, res.fileID);
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
            wx.setStorageSync('applicationInfo', that.data.applicationInfo);
            // 清空上传列表
            that.setData({
              files: [],
              uploading: false,
              hasImage: false
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
            console.log(i, res);
            // console.log('索引、原图、云名、ID', i, img, cloudFilename, res.fileID)
            // 图片上传成功后操作
            that.setData({
              'applicationInfo.materials': that.data.applicationInfo.materials.concat(res.fileID)
            });
            // 上传成功后，将切除第一个图片的剩余数组递归调用上传
            wx.hideLoading();
            uploadImagesOneByOne(new_array, i + 1);
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