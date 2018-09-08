//index.js
//获取应用实例
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    hiddenNewcoupons: true,
    hasFetchNewcoupons: false,
    autoplay: true,
    interval: 6000,
    duration: 800,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: "0",
    loadingMoreHidden: true,
    hasNoCoupons: true,
    coupons: [],
    searchInput: '',
    wxlogin: true,
    hovercoupons: true,
    iphone: false,
    pics: {}
  },

  //事件处理函数
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toTopic: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  kanjiaTap: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/kanjia-goods/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  tapSales: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: e.currentTarget.dataset.id
      })
    }
  },
  //弹窗优惠券关闭按钮
  hide: function () {
    this.setData({ hovercoupons: true })
  },
  //用户自主领取优惠券
  newCoupon: function (e) {
    var that = this;

    wx.request({
      url: app.globalData.urls + '/baby/discounts/fetch',
      method: 'POST',
      data: {
        couponId: e.currentTarget.dataset.id,//优惠券id
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 201) {
          wx.showToast({
            title: '成功领取',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            hiddenNewcoupons: true
          })
        }
      }
    })
  },
  userlogin: function (e) {
    var that = this;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    wx.login({
      success: function (wxs) {
        wx.request({
          url: app.globalData.urls + '/user/wxapp/register/complex',
          data: {
            code: wxs.code,
            encryptedData: encryptedData,
            iv: iv
          },
          success: function (res) {
            if (res.data.code != 0) {
              wx.showModal({
                title: '温馨提示',
                content: '需要您的授权，才能正常使用哦～',
                showCancel: false,
                success: function (res) { }
              })
            } else {
              that.setData({ wxlogin: true })
              app.login();
              wx.showToast({
                title: '授权成功',
                duration: 2000
              })
              app.globalData.usinfo = 1;
              wx.showTabBar();
            }
          }
        })
      }
    })
  },
  onShow: function () {
    var that = this;
    //检测购物车订单
    util.order()

    //如果未领取红包，该页面上显示的红包还能不能领取，如果不能则隐藏掉该红包
    //因为用户可以再礼券页面领取，如果仍显示红包会造成重复领取
    if (!that.data.hasFetchNewcoupons){
      wx.request({
        url: app.globalData.urls + '/baby/discounts/newcoupons',
        data: {
          openId: app.globalData.username
        },
        success: function (res) {
          if (res.statusCode == 200) {
            if (res.data) {
              that.setData({ hiddenNewcoupons: false });
              that.setData({
                newcoupons: res.data
              });
            }else{
              that.setData({ hasFetchNewcoupons: true });
            }
          }
        }
      })
    }

    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
        wx.hideTabBar();
      }
    }, 1000)
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) {
      that.setData({ iphone: true })
    }
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
    //首页幻灯片
    wx.request({
      url: app.globalData.urls + '/baby/banner/slide-container',
      data: {
        type: 'HOME'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            banners: res.data
          });
        }
      }
    })
    //4个功能展示位
    wx.request({
      url: app.globalData.urls + '/baby/banner/function-menus',
      data: {},
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            sales: res.data
          });
        }
      }
    })
    //获取拼团商品信息
    wx.request({
      url: app.globalData.urls + '/baby/banner/toptuan',
      data: {
        page: 0,
        size: 10
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            toptuan: res.data.content
          });
        }
      }
    })
    //获取砍价商品信息
    wx.request({
      url: app.globalData.urls + '/baby/cutdown',
      data: {},
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            topkans: res.data.content
          });
        }
      }
    })

    //获取精选专题信息
    wx.request({
      url: app.globalData.urls + '/baby/cms/news/list',
      data: {},
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            toptopics: res.data.content
          });
        }
      }
    })

    //获取推荐商品信息
    wx.request({
      url: app.globalData.urls + '/baby/banner/topgoods',
      data: {
        page: 0,
        size: 10
      },
      success: function (res) {
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.statusCode != 200 || res.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }

        for (var i = 0; i < res.data.content.length; i++) {
          goods.push(res.data.content[i]);
        }
        that.setData({
          goods: goods,
        });
      }
    })

    //新用户领取优惠券
    setTimeout(function () {
      if (!app.globalData.username){
          return;
      }
      wx.request({
        url: app.globalData.urls + '/baby/discounts/newcoupons',
        data: {
          openId: app.globalData.username
        },
        success: function (res) {
          if (res.statusCode == 200) {
            if (res.data){
              that.setData({ hiddenNewcoupons: false });
              that.setData({
                newcoupons: res.data
              });
            }else{
              that.setData({ hasFetchNewcoupons: true });
            }
          }
        }
      })
    }, 1000
    )
  },
  getkangoods: function (e) {
    var that = this;
    var pics = that.data.pics;
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/kanjia/list',
      data: {},
      success: function (res) {
        if (res.statusCode == 200) {
          var result = res.data.result
          for (var i = 0; i < result.length; i++) {
            if (e == result[i].goodsId) {
              pics[e] = result[i];
            }
          }
          that.setData({
            pics: pics,
          });
        }
      }
    })

  },
  hoverNewcoupons: function () {
    this.setData({ hovercoupons: false })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '—' + app.globalData.share,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPageScroll: function (t) {
    if (this.data.iphone == true && t.scrollTop >= 280) {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "scrollTop",
        naviphone: "iphneTop"
      })
    }
    if (t.scrollTop >= 280) {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "scrollTop"
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "",
        naviphone: ""
      })
    }
  }
})
