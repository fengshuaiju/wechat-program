//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    goodsId: null,//商品id
    cutDownId: null,
    share: 0,
    userID: 0,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    cutdownInfo: {},
    cutdownHelpers: {},
    currentPrice: 0,//当前价格
    cutTotalAmount: 0,//已经砍掉的价格
    helperNumber:0,//已经有多少名好友帮忙砍价
    swiperCurrent: 0,
    wxlogin: true,
    kanjiashare: true,//发起砍价 or 邀请好友砍价弹窗
    helpkanjiashare: true,//受邀砍价弹窗
    victorykanjia: true, //砍价成功弹窗
    postershow: true, //生成海报弹窗

    x: 0,
    y: 0,
    hidden: true,
    OriPrice: 0, //原价
    curPricese: 0,//当前价
    onPrice: 0,//已砍
    getPrice: 0,//还差
  },

  //砍价弹窗
  kanjiashow: function () {
    this.setData({
      kanjiashare: false
    })
  },
  closevictory: function () {
    this.setData({
      victorykanjia: true
    })
  },
  //发起砍价 or 邀请好友砍价弹窗
  getshare: function () {
    this.setData({
      kanjiashare: false
    })
  },
  //关闭发起砍价 or 关闭邀请好友砍价弹窗
  closeShare: function () {
    this.setData({
      kanjiashare: true,
    })
  },
  //关闭受邀砍价弹窗
  closeHelp: function () {
    this.setData({
      helpkanjiashare: true,
    })
  },
  //生成海报弹窗
  showposter: function () {
    this.setData({
      kanjiashare: true,
      postershow: false,
    });
  },
  closecode: function () {
    this.setData({
      postershow: true,
    });
  },
  //保存海报并关闭弹窗
  saveposter: function () {
    var that = this;
    console.log(that.data.codeimg)
    wx.saveImageToPhotosAlbum({
      filePath: that.data.codeimg,
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
    that.setData({
      postershow: true,
    })
  },

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
              if (res.data.existence) {
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
                    that.globalData.openId = res.data.openId;
                    that.globalData.token = res.data.access_token;
                    if (res.statusCode != 200) {
                      wx.hideLoading();
                      wx.showModal({
                        title: "提示",
                        content: "无法登录，请重试",
                        showCancel: false
                      });
                      return;
                    } else {
                      that.setData({ wxlogin: true })
                    }
                  }
                })
              } else {//如果不存在就去注册
                that.registerUser();
              }
            }
          }
        });
      }
    });
  },

  registerUser: function () {
    var that = this;
    wx.request({
      method: 'POST',
      url: that.globalData.urls + '/accounts/open/users/register',
      data: {
        userName: that.globalData.username
      },
      // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
        that.login();
      }
    })
  },

  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (!app.globalData.username) {
        that.setData({
          wxlogin: false
        })
      }
    }, 1000)
  },

  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    var timestamp = Date.parse(new Date()) / 1000;
    //判断用户是否登录
    setTimeout(function () {
      if (!app.globalData.username) {
        that.setData({
          wxlogin: false
        })
      }
    }, 1000)

    //首页顶部Logo
    wx.request({
      url: app.globalData.urls + '/baby/banner/top-logo',
      data: {},
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            toplogo: res.data.picUrl,
            topname: wx.getStorageSync('mallName')
          });
        }
      }
    })

    if (!e.id) { //扫码进入
      var scene = decodeURIComponent(e.scene);
      if (scene.length > 0 && scene != undefined) {
        var scarr = scene.split(',');
        var dilist = [];
        for (var i = 0; i < scarr.length; i++) {
          dilist.push(scarr[i].split('='))
        }
        if (dilist.length > 0) {
          var dict = {};
          for (var j = 0; j < dilist.length; j++) {
            dict[dilist[j][0]] = dilist[j][1]
          }
          that.data.goodsId = dict.i;
          that.data.cutDownId = dict.k;
          that.data.joiner = dict.j;
          that.data.share = dict.s;
        }
      }
      if (dict.s == 1) {
        setTimeout(function () {
          that.setData({
            helpkanjiashare: false
          })
        }, 800
        )
      }
    }

    //链接进入
    if (!e.scene) {
      that.data.goodsId = e.goodsId;
      that.data.cutDownId = e.cutDownId;
      that.data.joiner = e.joiner;
      that.data.share = e.share;
      that.data.kanjiashare = e.kanjiashare;
      if (e.share == 1) {
        setTimeout(function () {
          that.setData({
            helpkanjiashare: false
          })
        }, 800
        )
      }
    }

    //获取被砍商品的基本信息，原价、剩余时间、已经砍掉多少等
    wx.request({
      url: app.globalData.urls + '/baby/cutdown/info',
      data: {
        cutDownId: that.data.cutDownId
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            cutdownInfo: res.data,
            currentPrice: res.data.currentPrice,
            cutTotalAmount: res.data.cutTotalAmount,
            helperNumber: res.data.helperNumber
          });
          var ptime = res.data.leftSecond;
            var interval = setInterval(function () {
            var second = ptime;
            var day = Math.floor(second / 3600 / 24);
            var dayStr = day.toString();
            if (dayStr.length == 1) dayStr = '0' + dayStr;
            var hr = Math.floor((second - day * 3600 * 24) / 3600);
            var hrStr = hr.toString();
            if (hrStr.length == 1) hrStr = '0' + hrStr;
            var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
            var minStr = min.toString();
            if (minStr.length == 1) minStr = '0' + minStr;
            var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
            var secStr = sec.toString();
            if (secStr.length == 1) secStr = '0' + secStr;
            that.setData({
              countDownDay: dayStr,
              countDownHour: hrStr,
              countDownMinute: minStr,
              countDownSecond: secStr,
            });
            ptime--;
            if (ptime < 0) {
              clearInterval(interval);
              that.setData({
                countDownDay: '00',
                countDownHour: '00',
                countDownMinute: '00',
                countDownSecond: '00',
              });
            }
          }.bind(that), 1000);
        }
      }
    })

    // //生成二维码
    // wx.request({
    //   url: app.globalData.urls + '/qrcode/wxa/unlimit',
    //   data: {
    //     scene: "k=" + that.data.cutDownId + ",j=" + that.data.joiner + ",i=" + that.data.goodsId + ",s=1",
    //     page: "pages/kanjia/index"
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       wx.downloadFile({
    //         url: res.data.data,
    //         success: function (res) {
    //           that.setData({
    //             codeimg: res.tempFilePath
    //           });
    //         }
    //       })
    //     }
    //   }
    // })

    //延迟执行，否则会获取不到正确的砍价金额
    setTimeout(function () {
      that.setData({ userID: app.globalData.username });//用户ID
      that.getKanjiaHelper(that.data.cutDownId);
      that.getKanjiaInfoMyHelp(that.data.cutDownId, that.data.joiner);
    }, 100)
    if ('true' == that.data.kanjiashare){
      that.getshare();
    }
  },
  // onLoad 结束。。。。。

  //下拉刷新砍价人数
  onPullDownRefresh: function () {
    var that = this;
    var kjId = that.data.cutDownId;
    var joiner = that.data.joiner;
    //刷新获取砍价人员列表 和 被砍货物的基本信息
    that.getKanjiaHelper(kjId);
    that.getkanjiaInfo();
    wx.stopPullDownRefresh();
  },

  //跳转商品砍价页面
  getgoods: function () {
    var that = this;
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + that.data.goodsId
    })
  },

  getkanjiaInfo: function(){
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/cutdown/info',
      data: {
        cutDownId: that.data.cutDownId
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            cutdownInfo: res.data,
            currentPrice: res.data.currentPrice,
            cutTotalAmount: res.data.cutTotalAmount,
            helperNumber: res.data.helperNumber
          });
        }
      }
    })
  },

  //我也要砍价
  getkanjia: function () {
    var that = this;
    //暂时先跳转到砍价页面，后续记录跳转时的用户信息等
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + that.data.goodsId
    })
    // wx.request({
    //   url: app.globalData.urls + '/shop/goods/kanjia/join',
    //   data: {
    //     kjid: that.data.cutDownId,
    //     token: app.globalData.token
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       wx.navigateTo({
    //         url: "/pages/kanjia/index?kjId=" + res.data.data.cutDownId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
    //       })
    //     } else {
    //       wx.showModal({
    //         title: '错误',
    //         content: 'dadadadadadadadad',
    //         showCancel: false
    //       })
    //     }
    //   }
    // })
  },

  //分享小程序
  onShareAppMessage: function () {
    var that = this;
    that.setData({
      kanjiashare: true
    });
    return {
      title: "我发现一件好货，来帮我砍价吧～",
      path: "/pages/kanjia/index?kjId=" + that.data.cutDownId + "&joiner=" + that.data.joiner + "&id=" + that.data.goodsId + "&share=1",
      success: function (res) {
        // 转发成功
        that.setData({
          kanjiashare: true
        });
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //获取参与砍价的人员
  getKanjiaHelper: function (cutDownId) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/cutdown/helpers',
      data: {
        cutDownId: cutDownId
      },
      success: function (res) {
        var shareId = that.data.share;
        if (res.statusCode == 200) {
          that.setData({
            cutdownHelpers: res.data
          });
        }
      }
    })
  },

  //获取我帮忙砍价的信息
  getKanjiaInfoMyHelp: function (cutDownId, joiner) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/cutdown/my-help',
      data: {
        cutDownId: cutDownId,
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            kanjiaInfoMyHelp: res.data
          });
        }
      }
    })
  },

  helpKanjia: function () {
    var that = this;
    wx.request({
      method: 'POST',
      url: app.globalData.urls + '/baby/cutdown/help',
      data: {
        cutDownId: that.data.cutDownId,
        participant: app.globalData.username,
        goodsId: that.data.goodsId
      },
      success: function (res) {
        if (res.statusCode != 201) {
          wx.showModal({
            title: '错误',
            content: '未能砍成功',
            showCancel: false
          })
          return;
        }
        that.setData({
          mykanjiaInfo: res.data,
          helpkanjiashare: true,
          victorykanjia: false
        });
        that.getKanjiaHelper(that.data.cutDownId);
        that.getKanjiaInfoMyHelp(that.data.cutDownId, that.data.joiner);
        that.getkanjiaInfo();
      }
    })
  },

  //支付
  gopay: function () {
    var id = this.data.goodsId;
    var buykjInfo = this.buliduBuykjInfo();
    wx.setStorage({
      key: "buykjInfo",
      data: buykjInfo
    })
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buykj"
    })
  },

  //构建砍价信息
  buliduBuykjInfo: function () {

    var shopCarMap = {};
    shopCarMap.goodsId = this.data.cutdownInfo.goodsId;
    //砍价ID
    shopCarMap.cutDownId = this.data.cutdownInfo.cutDownId;
    //商品图片
    shopCarMap.pic = this.data.cutdownInfo.goodsPic;
    //商品名称
    shopCarMap.name = this.data.cutdownInfo.goodsName;
    //商品规格组合ID
    shopCarMap.propertyChildIds = this.data.cutdownInfo.propertiesJoint;
    //当前价格
    shopCarMap.price = this.data.cutdownInfo.currentPrice;
    //商品副标签
    shopCarMap.label = this.data.cutdownInfo.goodsLabel;
    
    shopCarMap.left = "";
    shopCarMap.active = true;
    //商品数 this.data.buyNumber;
    shopCarMap.number = 1

    shopCarMap.logisticsType = '快递';
    shopCarMap.logistics = 1;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  }

})
