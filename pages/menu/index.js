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
    activeCategoryId: '0',
    loadingMoreHidden: true,
    search: true,
    nonehidden: true,
    searchidden: true,

    categorieslist: [],
    categories:[],

    categoriesMap: new Map(),

    page: 0,
    size: 20
  },

  //点击左侧的分类栏
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getCategoryList(this.data.activeCategoryId);
  },

  //跳转到该分类商品列表
  levelClick: function (e) {
    wx.navigateTo({
      url: "/pages/menu-list/index?id=" + e.currentTarget.dataset.id
    })
  },

  // 滚动图滚动时间
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  // 搜索事件
  search: function(e){
    var that = this
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/search',
      data: {
        keyWord: e.detail.value,
        page: that.data.page,
        size: that.data.size
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            searchs: res.data.content,
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

  // 点击搜索框事件
  searchfocus: function(){
    this.setData({
      search: false,
      searchinput: true
    })
  },

  // 撤销搜索事件
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
      url: app.globalData.urls + '/baby/banner/slide-container',
      data: {
        type: 'MENU'
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
        var categories = [{ categoryId: '0', name: "所有分类" }];
        if (res.statusCode == 200) {
          wx.hideLoading();
          var categoriesMap = new Map;
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i].level == 1) {
              categories.push(res.data[i]);
              var infos = [];
              for(var j = 0; j< res.data.length; j++){
                if (res.data[i].categoryId == res.data[j].pid){
                  infos.push(res.data[j]);
                }
              }
              categoriesMap.set(res.data[i].categoryId, infos);
            }
          }
        }
        that.setData({
          categories: categories,
          activeCategoryId: 0,
          categoriesMap: categoriesMap
        });
        that.getCategoryList("0");
      }
    })
  },


  getCategoryList: function (categoryId) {
    var that = this;
    if (categoryId == '0') {
      var categorieslist = [];

      that.data.categoriesMap.forEach(function (item) {
        item.forEach(function (single){
          categorieslist.push(single);
        });
      });

     that.setData({
       categorieslist: categorieslist
     });
    }else{
      that.setData({
        categorieslist: that.data.categoriesMap.get(categoryId)
      });
    }
  },

  // 跳转到商品详情页
  toDetailsTap: function (e){
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
    this.setData({
      search: true,
      searchinput: false
    })
  },

  onShow: function () {
    var that = this;
    util.order();
  },

})