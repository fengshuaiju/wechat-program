//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[]
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  },
  onShow : function () {
    this.getMyCoupons();
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/discounts/my',
      data: {
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          var coupons = res.data;
          if (coupons.length > 0) {
            that.setData({
              coupons: coupons,
              loadingMoreHidden: true
            });
          }
        }else{
          that.setData({
            loadingMoreHidden: false
          });
        }
      }
    })
  },
  goBuy:function(){
    wx.navigateTo({
      url: '/pages/newcoupons/index'
    })
  },
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  }

})
