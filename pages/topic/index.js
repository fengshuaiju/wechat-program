var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var topictitle = that.data.topictitle;
    wx.request({
      url: app.globalData.urls + '/baby/cms/detail',
      data: {
        cmsId: e.id
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            topics: res.data,
            topictitle: res.data.title,
            topid: e.id
          });
          if(res.data.categoryId){
            wx.request({
              url: app.globalData.urls + '/baby/shop/goods/similar/recommend',
              data: {
                page: 0,
                size: 4,
                categoryId: res.data.categoryId
              },
              success: function (res) {
                if (res.statusCode == 200) {
                    that.setData({
                    goods: res.data.content,
                  });
                }
              }
            })
          }
          WxParse.wxParse('article', 'html', res.data.content, that, 5);
        }
      }
    })
  },
  onShareAppMessage: function (e) {
    return {
      title: this.data.topictitle,
      path: 'pages/topic/index?id=' + this.data.topid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})