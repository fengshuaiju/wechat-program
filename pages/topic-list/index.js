var app = getApp()
Page({
  data: {

  },
  tapContents: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/baby/cms/category/list',
      data: {
      },
      success: function (res) {
        //console.log(res.data.data[0].id)
        var topic = []
        if (res.statusCode == 200) {
          for (var i = 0; i < res.data.length; i++) {
            topic.push(res.data[i]);
          }
          that.setData({
            topics: topic,
            activecmsid: res.data[0].id
          });

        }
        that.gettapList(res.data[0].id)
      }
    })

  },
  tapTopic: function (e) {
    this.setData({
      activecmsid: e.currentTarget.dataset.id
    });
    this.gettapList(this.data.activecmsid);
  },
  gettapList: function (cmsid) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/cms/news/list',
      success: function (res) {
        var content = [];
        if (res.statusCode == 200) {
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i].categoryId == cmsid) {
              content.push(res.data[i]);
            }
          }
        }
        that.setData({
          contents: content
        });
      }
    })
  }

})