App({
  onLaunch: function () {
    var that = this;
    that.urls();
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search("iPhone X") != -1) {
          that.globalData.iphone = true;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/baby/open/config/get-value",
      data: {
        key: "mallName"
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync("mallName", res.data.data.value);
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/baby/score/send/rule",
      data: {
        code: "goodReputation"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.order_reputation_score = res.data.data[0].score;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/baby/open/config/get-value",
      data: {
        key: "recharge_amount_min"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.recharge_amount_min = res.data.data.value;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/baby/shop/goods/kanjia/list",
      data: {},
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.kanjiaList = res.data.data.result;
        }
      }
    });
    that.login();
  },
  siteInfo: require("config.js"),
  login: function () {
    var that = this;
    var token = that.globalData.token;
    if (token) {
      wx.request({
        url: that.globalData.urls + "/baby/user/check-token",
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.code != 0) {
            that.globalData.token = null;
            that.login();
          }
        }
      });
      return;
    }
    wx.login({
      success: function (res) {
        //微信登录接口返回的code作为参数换取用户的openid
        wx.request({
          url: that.globalData.urls + "/accounts/open/users/code2openId",
          data: {
            code: res.code
          },
          success: function (res) {
            that.globalData.username = res.data.openId;
            //根据返回的code判断是否成功且该用户是否已注册
            if (res.data.code == 0) {
              //成功获取到openId,检测是否已经注册过
              if (res.data.existence){
                wx.request({
                  url: that.globalData.urls + '/accounts/oauth/token',//请求后端向微信交换openid用的接口
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic dXNlcjpzZWNyZXQ='
                  },
                  data: {
                    username: res.data.openId,
                    grant_type: 'password',
                    password: 'N/A',
                    client_id: 'user'
                  },

                  success: function (res) {
                    that.globalData.token = res.data.access_token;
                    if (res.statusCode != 200) {
                      wx.hideLoading();
                      wx.showModal({
                        title: "提示",
                        content: "无法登录，请重试",
                        showCancel: false
                      });
                      return;
                    }
                  }
                })
              }else{//如果不存在就去注册
                that.registerUser();
              }
            }
            // that.globalData.usinfo = 0;
          }
        });
      }
    });
  },

  registerUser: function (){
    var that = this;
    wx.request({
      method: 'POST',
      url: that.globalData.urls + '/accounts/open/users/register',
      data: {
        username: that.globalData.username
      },
      // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
        that.login();
        console.log("registerUser cuccess!!!!!!!!!!!!!!!!!!!!!!!!!");
      }
    })
  },


  urls: function () {
    var that = this;
    that.globalData.urls = that.siteInfo.url + that.siteInfo.subDomain;
    that.globalData.share = that.siteInfo.shareProfile;
  },

  // sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
  //   var that = this;
  //   wx.request({
  //     url: that.globalData.urls + "/baby/template-msg/put",
  //     method: "POST",
  //     header: {
  //       "content-type": "application/x-www-form-urlencoded"
  //     },
  //     data: {
  //       token: that.globalData.token,
  //       type: 0,
  //       module: "order",
  //       business_id: orderId,
  //       trigger: trigger,
  //       template_id: template_id,
  //       form_id: form_id,
  //       url: page,
  //       postJsonString: postJsonString
  //     }
  //   });
  // },
  // sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
  //   var that = this;
  //   wx.request({
  //     url: that.globalData.urls + "/baby/template-msg/put",
  //     method: "POST",
  //     header: {
  //       "content-type": "application/x-www-form-urlencoded"
  //     },
  //     data: {
  //       token: that.globalData.token,
  //       type: 0,
  //       module: "immediately",
  //       template_id: template_id,
  //       form_id: form_id,
  //       url: page,
  //       postJsonString: postJsonString
  //     }
  //   });
  // },

  globalData: {
    userInfo: null,
    urls: {},
    username: null
  }
});