//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    page: 0,
    size: 20
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function (e) {
    wx.showLoading();
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/search',
      data: {
        categoryId: e.id,
        page: that.data.page,
        size: that.data.size
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200){
          if (res.data.numberOfElements == 0) {
            that.setData({
              loadingMoreHidden: false,
            });
            return;
          } else {
            that.setData({
              goods: res.data.content,
              loadingMoreHidden: true
            });
            return;
          }
        }else{
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
      }
    })
  }
})