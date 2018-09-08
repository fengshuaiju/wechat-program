//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    page:0,
    size:20
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  home: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  onShow: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/fav/list',
      data: {
        page: that.data.page,
        size: that.data.size,
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            favList: res.data.content,
            loadingMoreHidden: true
          });
        } else if (res.statusCode != 200) {
          that.setData({
            favList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  }


  
})