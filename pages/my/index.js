const app = getApp();
var util = require('../../utils/util.js')

Page({
	data: {
    amount:0,
    freeze:0,//冻结金额
    score:0,
    continueDays:0,
    isSigned: false,
    tabClass: ["", "", "", "", ""]
  },
 
  onLoad: function () {
    this.getUserAmount();
    this.checkScoreSign();
  },
  onShow() {
    this.getUserAmount();
    this.checkScoreSign();
    //更新订单状态    
    util.order();
  },

  //授权获取用户信息
  bindGetUserInfo: function (e) {
    var msg = e.detail.errMsg;
    console.log(e);
    //授权成功
    if (msg == "getUserInfo:ok"){
      var userInfo = e.detail.userInfo;
      wx.request({
        url: app.globalData.urls + '/accounts/v1/users',
        method: 'PUT',
        header: {
          'Authorization': 'Bearer ' + app.globalData.token
        },
        data: userInfo,
        success: function (res) {
          if (res.statusCode == 204) {
            console.log("success");
          }
        }
      })

    }
  },

  //获取用户账户信息
  getUserAmount: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/user/account',
      data: {
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            amount: res.data.amount,
            score: res.data.score
          });
        }
      }
    })
  },

  //检查是否签到过
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/score/today-signed',
      data: {
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            isSigned: res.data.isSigned,
            continueDays: res.data.continueDays
          });
        }
      }
    })
  },

  relogin:function(){
    var that = this;
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        app.globalData.token = null;
        app.login();
        wx.showModal({
          title: '提示',
          content: '重新登陆成功',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.onShow();
            }
          }
        })
      },
      fail(res){
        //console.log(res);
        wx.openSetting({});
      }
    })
  },

  /////////////////

  //转跳到不同状态的订单列表页
  goorderlist(e) {
    var id = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "/pages/order-list/index?currentType=" + id
    })
  },

  address: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  withdraw: function () {
    wx.navigateTo({
      url: "/pages/withdraw/index"
    })
  }, 
  score: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  }, 
  mykanjia: function () {
    wx.navigateTo({
      url: "/pages/my-kanjia/index"
    })
  },
  mycoupons: function () {
    wx.navigateTo({
      url: "/pages/mycoupons/index"
    })
  },
  favlist: function () {
    wx.navigateTo({
      url: "/pages/fav-list/index"
    })
  },
  
})