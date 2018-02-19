var postsData = require('../../../data/posts-data.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlayingMusic: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var globalData = app.globalData;
    console.log(globalData);

    var postId = options.id;

    // 设置数据 -> 使其他方法可以取得 postId 值
    this.data.currentPostId = postId;

    // 获取单独的文章对象
    var postData = postsData.postList[postId];

    this.setData({
      postData: postData
    });

    // 获取收藏缓存数据 收藏缓存数据为数据类型
    var postsCollected = wx.getStorageSync('posts_collected');
    if (postsCollected) {
      // 为视图层 if 判断提供数据
      var postCollected = postsCollected[postId];
      this.setData({
        collected: postCollected
      })
    } else {
      // 未收藏则将对应文章编号数据设置 false
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected);
    }

    // 在音乐没有停止时退出页面后，记录音乐播放状态的播放按钮、背景，以便再次进入恢复状态
    if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId == postId) {
      this.setData({
        isPlayingMusic: true
      });
    }

    // 监听音乐播放
    this.setMusicMonitor();
  },

  /* 
   * 监听音乐播放
   */ 
  setMusicMonitor: function () {
    var postId = this.data.currentPostId;
    var that = this;

    wx.onBackgroundAudioPlay(function () {
      that.setData({
        isPlayingMusic: true
      });
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentMusicPostId = postId;
    });

    wx.onBackgroundAudioPause(function () {
      app.globalData.g_isPlayingMusic = false;
      that.setData({
        isPlayingMusic: false
      });
    })
  },
  /*
   * 音乐播放控制功能
   */
  onMusicTap: function (event) {
    var postId = this.data.currentPostId;
    var postData = postsData.postList[postId];
    var isPlayingMusic = this.data.isPlayingMusic;
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false,
      })
    } else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.dataUrl,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImgUrl
      });

      if (app.globalData.g_isPlayingMusic) {
        this.setData({
          isPlayingMusic: true,
        })
      }
    }

  },

  onCollectionTap: function (event) {
    // this.getPostsCollectedAsy(); // 获取收藏缓存 异步方法
    this.getPostsCollectedSyc(); // 获取收藏缓存 同步方法
  },

  // 获取收藏缓存 同步
  getPostsCollectedSyc: function () {
    // 获取缓存信息
    var postsCollected = wx.getStorageSync('posts_collected');
    var postCollected = postsCollected[this.data.currentPostId];

    this.showToast(postsCollected, postCollected);
  },

  // 获取收藏缓存 异步
  /*
  getPostsCollectedAsy: function () {
    var that = this;
    wx.getStorage({
      key: 'posts_collected',
      success: function (res) {
        // 获取缓存信息
        var postsCollected = res.data;
        var postCollected = postsCollected[that.data.currentPostId];

        that.showToast(postsCollected, postCollected);
      },
    });
  },
  */

  showToast: function (postsCollected, postCollected) {

    // 收藏 -> 未收藏 / 未收藏 -> 收藏
    postCollected = !postCollected;

    // 更新缓存
    postsCollected[this.data.currentPostId] = postCollected;

    // 更新文章是否收藏的缓存值
    wx.setStorageSync('posts_collected', postsCollected);

    // 更新数据绑定变量 -> 实现切换图片
    this.setData({
      collected: postCollected
    });

    // 消息提示框
    wx.showToast({
      title: postCollected ? '收藏成功' : '取消收藏',
      duration: 1000
    });

  },

  // 收藏/取消文章，成本较低，无需用户特别进行确认
  /*
  showModal: function (postsCollected, postCollected) {
    // 使用 that 代替 this，避免下面的回掉使得 this 改变指向
    var that = this;

    wx.showModal({
      title: '收藏',
      content: postCollected ? '取消收藏' : '是否收藏',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#666',
      confirmText: '确认',
      confirmColor: '#405f80',
      success: function (res) {
        if (res.confirm) {
          // 收藏 -> 未收藏 / 未收藏 -> 收藏
          postCollected = !postCollected;

          // 更新缓存
          postsCollected[that.data.currentPostId] = postCollected;

          // 更新文章是否收藏的缓存值
          wx.setStorageSync('posts_collected', postsCollected);

          // 更新数据绑定变量 -> 实现切换图片
          that.setData({
            collected: postCollected
          });
        }
      }

    })
  },
  */

  // 分享功能，仅供测试 showActionSheet ，并没有实现，目前微信功能仅支持分享到微信好友/群和朋友圈
  onShareTap: function () {
    var itemList = [
      '分享到朋友圈',
      '分享到QQ',
      '分享到微博',
      '分享到豆瓣'
    ];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: '#405f80',
      success: function (res) {
        wx.showModal({
          title: '用户' + itemList[res.tapIndex],
          content: '用户是否取消？',
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})