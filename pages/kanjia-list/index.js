//index.js
var app = getApp();
Page({
  data: {
    kanjialist:[],

    page:0,
    size:20
  },

  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/baby/cutdown',
      data:{
        page:that.data.page,
        size:that.data.size
      },
      success: function (res) {
        if (res.statusCode == 200){
          that.setData({
            kanjialist: res.data.content
          });
        }
      },
    })
  },

  //这里是跳转砍价商品详情页
  gokj: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + id

    })
  }

})