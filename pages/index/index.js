//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    flag: true,
    indicatorDots: true,
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
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,//优惠券id
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功领取',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            flag: true
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
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        if (res.data) {
          that.data.shopCarInfo = res.data
          if (res.data.shopNum > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: ''+res.data.shopNum+''
            })
          } else {
            wx.removeTabBarBadge({
              index: 2,
            })
          }
        } else {
          wx.removeTabBarBadge({
            index: 2,
          })
        }
      }
    })
    wx.request({
      url: app.globalData.urls + '/order/statistics',
      data: { token: app.globalData.token },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data.count_id_no_pay > 0) {
            wx.setTabBarBadge({
              index: 3,
              text: '' + res.data.data.count_id_no_pay + ''
            })
          } else {
            wx.removeTabBarBadge({
              index: 3,
            })
          }
        }
      }
    })
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
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        type: 'toplogo'
      },
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
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        type: 'home'
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
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        key: 'mallName',
        type: 'sale'
      },
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
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        type: 'toptuan'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.request({
            url: app.globalData.urls + '/baby/open/config/get-value',
            data: {
              key: 'toptuan',
            },
            success: function (res) {
              if (res.statusCode == 200) {
                that.setData({
                  toptuaninfo: res.data
                });
              }
            }
          })
          that.setData({
            toptuan: res.data
          });
        }
      }
    })
    //获取砍价商品信息
    wx.request({
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        key: 'mallName',
        type: 'topkan'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          var kb = res.data[0].remark;
          var kbarr = kb.split(',');
          that.setData({
            topkan: res.data
          });
          var topkans = [];
          for (var i = 0; i < kbarr.length; i++) {
            wx.request({
              url: app.globalData.urls + '/baby/shop/goods/detail',
              data: {
                id: kbarr[i]
              },
              success: function (res) {
                if (res.statusCode == 200) {
                  topkans.push(res.data.basicInfo);
                }
                that.setData({
                  topkans: topkans
                });
              }
            })
            that.getkangoods(kbarr[i])
          }
        }
      }
    })
    //获取精选专题信息
    wx.request({
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        key: 'mallName',
        type: 'toptopic'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          var kb = res.data[0].remark;
          var kbarr = kb.split(',');
          that.setData({
            toptopic: res.data
          });
          var toptopics = [];
          for (var i = 0; i < kbarr.length; i++) {
            wx.request({
              url: app.globalData.urls + '/baby/cms/news/detail',
              data: {
                id: kbarr[i]
              },
              success: function (res) {
                if (res.statusCode == 200) {
                  toptopics.push(res.data);
                }
                that.setData({
                  toptopics: toptopics
                });
              }
            })
          }
        }
      }
    })
    //获取推荐商品信息
    wx.request({
      url: app.globalData.urls + '/baby/open/config/get-value',
      data: {
        key: 'topgoods'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            topgoods: res.data
          });
          wx.request({
            url: app.globalData.urls + '/baby/shop/goods/list',
            data: {
              recommendStatus: 1,
              pageSize: 10
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

              for (var i = 0; i < res.data.length; i++) {
                goods.push(res.data[i]);
              }
              that.setData({
                goods: goods,
              });
            }
          })
        }
      }
    })

    //新用户领取优惠券
    setTimeout(function () {
      wx.request({
        url: app.globalData.urls + '/baby/banner/list',
        data: {
          key: 'mallName',
          type: 'newcoupons'
        },
        success: function (res) {

          if (res.statusCode == 200) {

          //暂时把领取优惠券的窗口一直打开

            // wx.request({//识别用户是否可以领取优惠券
            //   //https://api.it120.cc/formatTime/discounts/fetch?id=2495&token=f3dc9820-d506-4f8a-9116-8609f64cb910&detect=true
            //   url: app.globalData.urls + '/discounts/fetch',
            //   data: {
            //     id: res.data.data[0].businessId,//优惠券id
            //     token: app.globalData.token,
            //     detect: true
            //   },
            //   success: function (res) {
            //     if (res.data.code == 0) {
            //       that.setData({ flag: false })
            //     }
            //   }
            // });

            that.setData({ flag: false });

            that.setData({
              newcoupons: res.data
            });
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
