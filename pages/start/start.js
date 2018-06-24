//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {},
    //授权获取用户信息使用
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    flag : false
  },

  //跳转到商品页面
  goToIndex:function(){
    var that = this;
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  //页面加载完之后执行
  onLoad:function(){
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    app.getUserInfo(function(userInfo){
      that.setData({
        userInfo: userInfo
      })
    })

  },

  //获取用户信息使用,在授权按钮的时候触发事件
  bindGetUserInfo: function (e) {
    console.log("===================================>>>>>>>>>>>>>>>>>>>>>");
    console.log(e.detail.userInfo);
  },
  
  onShow:function(){

  },
  onReady: function(){
    var that = this;
    setTimeout(function(){
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x*30).toFixed(1);
      if(angle>14){ angle=14; }
      else if(angle<-14){ angle=-14; }
      if(that.data.angle !== angle){
        that.setData({
          angle: angle
        });
      }
    });
  }
});