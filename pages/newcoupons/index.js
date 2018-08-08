//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons: '',
    busid: 0
  },

  listenerCouponsInput: function (e) {
    this.data.coupons = e.detail.value;
    this.data.id = e.currentTarget.dataset.id;
  },
  //兑换
  listenerDuiHuan: function () {
    //console.log('id', this.data.coupons);
    wx.request({
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: this.data.busid,
        pwd: this.data.coupons,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '礼券兑换成功',
            icon: 'success',
            duration: 2000
          })
        }
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '兑换失败',
            content: '礼券已经兑换完了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '兑换失败',
            content: '兑换数量已达最大上限',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20000) {
          wx.showModal({
            title: '兑换失败',
            content: '输入的口令有误，请重新输入',
            showCancel: false
          })
          return;
        }
      }
    })
  },
  onLoad: function () {
    var that = this
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.getCoupons();
    wx.request({
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        key: 'mallName',
        type: 'duihuan'
      },
      success: function (res) {
        if (res.statusCode == 200 && app.globalData.system != 'key') {
          that.setData({
            banners: res.data,
            busid: res.data[0].businessId
          });
        }
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/discounts/coupons',
      data: {
        type: 'shop'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data
          });
        }
      }
    })
  },
  //点击领取礼券
  gitCoupon: function (e) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '礼券已经领完了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '您已经领过了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '礼券已经过期',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '礼券领取成功',
            icon: 'success',
            duration: 2000
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
  }
})
