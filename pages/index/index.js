//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    //轮播图
    //是否自动播放
    autoplay: true,
    //自动切换时间间隔
    interval: 3000,
    //滑动动画时长
    duration: 1000,

    //用户信息
    userInfo: {},

    //轮播图是否播放到当前图片标志
    swiperCurrent: 0,

    //服装类型：童装，上衣。。。
    categories: [],

    activeCategoryId: 0,
    //商品数组
    goods:[],
    //上层搜索框
    scrollTop:"0",

    //是否已经加载到最后了
    loadingMoreHidden:true,

    //是否为用户显示优惠券
    hasNoCoupons:true,
    //优惠券列表
    coupons: [],
    //搜索输入框内容
    searchInput: '',

    //没有用到的变量
    loadingHidden: false, // loading
    selectCurrent: 0,
    indicatorDots: true,
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },

  //当轮播图片改变的时候，触发这个事件
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },

  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/goods-details?id="+e.currentTarget.dataset.id
    })
  },

  /**
   * 点击图片时，进行小程序内的跳转
   */
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },

  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  scroll: function (e) {
    //  console.log(e) ;
    var that = this,scrollTop=that.data.scrollTop;
    that.setData({
      scrollTop:e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /*
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    */

    /**
     * 获取轮播图中的图片
     */
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          that.setData({
            banners: res.data.data
          });
        }
      }
    })
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/category/all',
      success: function(res) {
        var categories = [{id:0, name:"全部"}];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:0
        });
        that.getGoodsList(0);
      }
    })
    that.getCoupons ();
    that.getNotice ();
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput
      },
      success: function(res) {
        that.setData({
          goods:[],
          loadingMoreHidden:true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden:false,
          });
          return;
        }
        for(var i=0;i<res.data.data.length;i++){
          goods.push(res.data.data[i]);
        }
        that.setData({
          goods:goods,
        });
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
        }
      }
    })
  },
  gitCoupon : function (e) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
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
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
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
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize :5},
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch : function (){
    this.getGoodsList(this.data.activeCategoryId);
  }
})
