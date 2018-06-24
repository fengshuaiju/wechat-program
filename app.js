App({

  onLaunch: function () {

    var that = this;
    //获取商城名称
    wx.request({
      url: that.globalData.subDomain + '/baby/open/base/config',
      data: {
        key: 'mallName'
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync('mallName', res.data.data.value);
        }
      }
    })

    //好评积分赠送规则
    wx.request({
      url: that.globalData.subDomain + '/baby/open/base/config/reward/good-reputation',
      data: {
        code: 'goodReputation'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.order_reputation_score = res.data.data[0].score;
        }
      }
    })

    //充值最少金额
    wx.request({
      url: that.globalData.subDomain + '/baby/open/base/config',
      data: {
        key: 'recharge_amount_min'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.recharge_amount_min = res.data.data.value;
        }
      }
    })

    // // 获取砍价设置
    // wx.request({
    //   url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/kanjia/list',
    //   data: {},
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       that.globalData.kanjiaList = res.data.data.result;
    //     }
    //   }
    // })

    //暂时不进行登录
    this.login();

  },

  //微信登录
  login: function () {
    var that = this;
    var token = that.globalData.token;
    if (token) {
      //检测token是否过期
      wx.request({
        url: that.globalData.subDomain + '/accounts/v1/users/check-token',
        header: {
          'Authorization': 'Bearer ' + that.globalData.token,
        },
        success: function (res) {
          console.log("!!!!!!!!!!!!assasasasssssssssssssssssssssssssssssssssssssssss");
          //如果token过期，直接重新登录
          if (res.data.code != 0) {
            that.globalData.token = null;
            that.login();
          }
        }
      })
      return;
    }
    wx.login({
      success: function (res) {
        //用微信小程序返回的code传到后端并换区openId
        var code = res.code; 
        wx.request({
          url: that.globalData.subDomain + '/accounts/open/users/code2openId',
          data: {
            code: code
          },
          success: function (res) {
            if (res.data.code == 0) {
              // 换取openid后，拿openId登录
              var openid = res.data.openId;
              wx.request({
                url: that.globalData.subDomain + '/accounts/oauth/token',//请求后端向微信交换openid用的接口
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                  'Authorization': 'Basic dXNlcjpzZWNyZXQ='
                },
                data: {
                  username: openid,
                  grant_type: 'password',
                  password: 'N/A',
                  client_id: 'user'
                },
                success: function (res) {
                  //如果微信登录不上，就是因为没有注册
                  //TODO
                  if (res.statusCode != 200) {
                    //去注册
                    that.registerUser();
                    return;
                  }
                  that.globalData.token = res.data.access_token;
                  that.globalData.username = openid;

                  console.log("okokokokokokokokokokokokokokokokokokokok");
                  console.log(that.globalData.username);
                  console.log(that.globalData.token);

                  
                  wx.request({
                    url: that.globalData.subDomain + '/accounts/v1/users/check-token',
                    header: {
                      'Authorization': 'Bearer ' + that.globalData.token,
                    },
                    success: function (res) {
                      console.log("!!!!!!!!!!!!assasasasssssssssssssssssssssssssssssssssssssssss");
                      //如果token过期，直接重新登录
                      if (res.data.code != 0) {
                        that.globalData.token = null;
                        //that.login();
                      }
                    }
                  })
                  






                }
              })           
            } else {
              // 登录错误
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
            }
          }
        })
      }
    })
  },

  //进行注册
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; 
        
        console.log("succccccccccccccccccccccccccessssssssssssssssssss");
        console.log(res);

        // 微信登录接口返回的 code 参数，换取openid
        wx.request({
          url: that.globalData.subDomain + '/accounts/open/users/code2openId',
          data: {
            code: code
          },
          success: function (res) {
            if (res.data.code == 0){
              // 换取openid后，拿openId注册
              var openid = res.data.openId;
              wx.request({
                method: 'POST',
                url: that.globalData.subDomain + '/accounts/open/users/register',
                data: {
                  username: openid
                },
                // 设置请求的 参数
                success: (res) => {
                  wx.hideLoading();
                  that.login();
                }
              })
            }else{
              // 登录错误
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
            }
          }
        })



      }
    })
  },

  // sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
  //   var that = this;
  //   wx.request({
  //     url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded'
  //     },
  //     data: {
  //       token: that.globalData.token,
  //       type: 0,
  //       module: 'order',
  //       business_id: orderId,
  //       trigger: trigger,
  //       template_id: template_id,
  //       form_id: form_id,
  //       url: page,
  //       postJsonString: postJsonString
  //     },
  //     success: (res) => {
  //       //console.log('*********************');
  //       //console.log(res.data);
  //       //console.log('*********************');
  //     }
  //   })
  // },
  // sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
  //   var that = this;
  //   wx.request({
  //     url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded'
  //     },
  //     data: {
  //       token: that.globalData.token,
  //       type: 0,
  //       module: 'immediately',
  //       template_id: template_id,
  //       form_id: form_id,
  //       url: page,
  //       postJsonString: postJsonString
  //     },
  //     success: (res) => {
  //       console.log(res.data);
  //     }
  //   })
  // },

  //获取用户信息
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登陆接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              //全局变量进行设置的时候，不需要用 XXX.setData({});
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  globalData: {
    userInfo: null,
    subDomain: "https://crazy-lobster.cn/api", // 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
    version: "2.0",
    shareProfile: '百款精品商品，总有一款适合您', // 首页转发的时候话术
    token: null,
    username: null
  }

})