//index.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 8000,
    duration: 800,
    swiperCurrent: 0,
    selectCurrent: 0,
    activeCategoryId: 0,
    loadingMoreHidden: true,
    search: true,
    nonehidden: true,
    searchidden: true
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  levelClick: function (e) {
    wx.navigateTo({
      url: "/pages/menu-list/index?id=" + e.currentTarget.dataset.id
    })
  },
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  search: function(e){
    var that = this
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/list',
      data: {
        nameLike: e.detail.value
      },
      success: function (res) {
        if (res.statusCode == 200) {
          var searchs = [];
          for (var i = 0; i < res.data.length; i++) {
            searchs.push(res.data[i]);
          }
          that.setData({
            searchs: searchs,
            searchidden: false,
            nonehidden: true
          });
        }else{
          that.setData({
            searchidden: true,
            nonehidden: false
          });
        }
      }
    })
    
  },
  searchfocus: function(){
    this.setData({
      search: false,
      searchinput: true
    })
  },
  searchclose: function(){
    this.setData({
      search: true,
      searchinput: false
    })
  },
  onLoad: function () {
    wx.showLoading();
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search('iPhone X') != -1) {
          that.setData({
            iphone: "iphoneTop",
            iponesc: "iphonesearch"
          });
        }
      }
    })
    wx.request({
      url: app.globalData.urls + '/baby/banner/list',
      data: {
        key: 'mallName',
        type: 'goods'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            banners: res.data
          });
        }
      }
    }),
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/category/all',
      success: function (res) {
        var categories = [{ id: 0, name: "所有分类" }];
        if (res.statusCode == 200) {
          wx.hideLoading();
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i].level == 1) {
              categories.push(res.data[i]);
            }
          }
        }//
        that.setData({
          categories: categories,
          activeCategoryId: 0
        });
        that.getGoodsList(0);
      }
    })
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/category/all',
      success: function (res) {
        var categorieslist = [];
        if (res.statusCode == 200) {
          for (var i = 0; i < res.data.length; i++) {
            if (categoryId != '') {
              if (res.data[i].pid == categoryId) {
                categorieslist.push(res.data[i]);
              }
            } else {
              //categorieslist.push(res.data.data[i]);
              if (res.data[i].pid != 0) {
                categorieslist.push(res.data[i]);
              }
            }
          }
        }//
        that.setData({
          categorieslist: categorieslist,
        });
      }
    })
  },
  toDetailsTap: function (e){
    wx.navigateTo({
      url: "/baby/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
    this.setData({
      search: true,
      searchinput: false
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
              text: '' + res.data.shopNum + ''
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
    });

    util.order();
  },

})