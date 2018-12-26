var app = getApp()
Page({
  data: {
    score: 0,//积分
    score_sign_continuous: 0,//连续签到次数
    ci: false //今天是否已签到
  },

  onShow() {
    this.checkScoreSign();
  },

  //签到按钮
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/score/sign',
      header:{
        Authorization: "Bearer " + app.globalData.token
      },
      success: function (res) {
        if (res.statusCode == 201) {
          that.setData({
            score_sign_continuous: res.data.continueDays,
            ci: res.data.isSigned,
            score: res.data.score
          });
        }
        wx.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/score/today-signed',
      header: {
        Authorization: "Bearer " + app.globalData.token
      },
      success: function (res) {
        if (res.statusCode == 200){
          that.setData({
            score_sign_continuous: res.data.continueDays,
            ci: res.data.isSigned,
            score: res.data.score
          });
        }
      }
    })
  },

  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.checkScoreSign();
    
    //获取签到规则
    wx.request({
      url: app.globalData.urls + '/baby/score/sign/rules',
      data: { 
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            rules: res.data
          });
        }
      }
    })

  },
  score: function () {
    wx.navigateTo({
      url: "/pages/newcoupons/index"
    })
  },
  home: function () {
    wx.switchTab({
      url: '../index/index'
    })
  }

})