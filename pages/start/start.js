//login.js
//获取应用实例
var app = getApp();

function countdown(that) {
  var second = that.data.second;
  var home = that.data.home;
  if (home == 0) {
    if (second == 0) {
      wx.switchTab({
        url: '../index/index'
      })
    }
  }
  var time = setTimeout(function() {
    that.setData({
      second: second - 1
    });
    countdown(that);
  }, 1000)

}
Page({
  data: {
    second: 1,
    home: 0
  },

  home: function() {
    this.setData({
      home: 1
    });
    wx.switchTab({
      url: '../index/index'
    })
  },
  //点击广告，跳转详情页
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      this.setData({
        home: 1
      });
      wx.redirectTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id + '&share=1'
      })
    }
  },

  onLoad: function() {
    var that = this;
    countdown(that);

    wx.request({
      url: app.globalData.urls + '/baby/open/config/starter',
      success: function(res) {
        if (res.statusCode == 200) {
          that.setData({
            sales: res.data
          });
        }
      }
    })

    //获取购物车数据
    setTimeout(function() {

      wx.request({
        url: app.globalData.urls + '/baby/shop/goods/shop-car',
        data: {
          username: app.globalData.username
        },
        success: function(res) {
          var shopCarInfo = {};
          shopCarInfo.shopList = [];
          shopCarInfo.shopNum = 0;

          if (res.statusCode == 200) {
            var list = [];
            var totalBuy = 0;
            if (res.data.list.length != 0) {
              var shopCarList = [];
              shopCarList = res.data.list;
              for (let i = 0; i < shopCarList.length; i++) {
                // 构建购物车信息
                var shopCarMap = {};
                shopCarMap.goodsId = shopCarList[i].goodsId;
                //商品图片
                shopCarMap.pic = shopCarList[i].pic;
                //商品名称
                shopCarMap.name = shopCarList[i].name;
                //商品规格组合ID
                shopCarMap.propertyChildIds = shopCarList[i].propertyChildIds;
                //商品副信息
                shopCarMap.label = shopCarList[i].label;
                //选中的商品价格
                shopCarMap.price = shopCarList[i].price;
                //要购买的件数
                shopCarMap.buyNumber = shopCarList[i].buyNumber;

                totalBuy = totalBuy + shopCarList[i].buyNumber;
                list.push(shopCarMap);
              }
              shopCarInfo.shopList = list;
              shopCarInfo.shopNum = totalBuy;
              
              // 写入本地存储
              wx.setStorage({
                key: "shopCarInfo",
                data: shopCarInfo
              })

            }else{
              wx.removeStorageSync("shopCarInfo")
            }
          }else{
            wx.removeStorageSync("shopCarInfo")
          }
        }
      })
    }, 1000)
  }



});