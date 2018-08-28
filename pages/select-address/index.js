//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.urls +'/baby/user/shipping-address/update',
      data: {
        token:app.globalData.token,
        id:id,
        isDefault:'true'
      },
      success: (res) =>{
        wx.navigateBack({})
      }
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  },
  onShow : function () {
    this.initShippingAddress();
  },

  //获取我的地址列表
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls +'/baby/user/shipping-address/list',
      data: {
        username: app.globalData.username
      },
      success: (res) =>{
        if (res.statusCode == 200) {
          if (res.data.length != 0){
            that.setData({
              addressList: res.data,
              loadingMoreHidden: true
            });
          } else {
            that.setData({
              addressList: null,
              loadingMoreHidden: false
            });
          }
        } 
      }
    })
  }

})
