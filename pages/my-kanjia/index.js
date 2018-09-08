const app = getApp()

Page({
  data: {
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    kjgoods: [],
    page: 0,
    size: 20
  },

  onLoad() {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/baby/cutdown/list',
      data:{
        page: that.data.page,
        size: that.data.size,
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            kjgoods: res.data.content
          });
          console.log(res.data.content);
        }
      }
    })
  },

  gokj: function (e) {
    var id = e.currentTarget.dataset.id
    wx.request({
      url: app.globalData.urls + '/shop/goods/kanjia/join',
      data: {
        kjid: id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.navigateTo({
            url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId

          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },

  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  }

})