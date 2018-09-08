//index.js
var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      allSelect: true,
      noSelect: false,
      list: []
    },
    delBtnWidth: 120,    //删除按钮宽度单位（rpx）

    sales: [],
    page: 0,
    size: 4
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },

  //设置删除按钮宽度
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }

    that.initEleWidth();
    that.onShow();

    //猜你喜欢
    that.guessLike();
  },

  guessLike: function(){
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/guess/like',
      data: {
        username: app.globalData.username,
        page: that.page,
        size: that.size
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            sales: res.data.content
          })
        }
      }
    })
  },

  onShow: function () {
    var that = this;
    util.order()

    var shopList = [];
    // 获取购物车数据
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');

    if (shopCarInfoMem) {
      shopList = shopCarInfoMem.shopList
    }
    that.data.goodsList.list = shopList;
    that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), shopList);
  },

  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },

  touchM: function (e) {
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.goodsList.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.goodsList.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },

  //删除单项
  delItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list.splice(index, 1);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

    var goodsIds = [];
    goodsIds[0] = e.currentTarget.dataset.id;

    //向后端发送删除请求
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/shop-car',
      method: 'DELETE',
      data: {
        goodsIds: goodsIds,
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          this.reLoadShopCar();
          util.order();
        }
      }
    })

    util.order();
  },

  //选中事件
  selectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },

  //总价
  totalPrice: function () {
    var list = this.data.goodsList.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.buyNumber;
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total;
  },

  //全选
  allSelect: function () {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },

  //没有选择
  noSelect: function () {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },

  setGoodsList: function (saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    });
  },

  bindAllSelect: function () {
    var currentAllSelect = this.data.goodsList.allSelect;
    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },

  jiaBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].buyNumber < 10) {
        list[parseInt(index)].buyNumber++;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

        //向后端发送修改请求
        wx.request({
          url: app.globalData.urls + '/baby/shop/goods/shop-car',
          method: 'PUT',
          data: {
            shoppingCartId: list[parseInt(index)].shoppingCartId,
            buyNumber: list[parseInt(index)].buyNumber,
            username: app.globalData.username
          },
          success: function (res) {
            if (res.statusCode == 204) {
              util.order();
            }
          }
        })

      }
    }
  },

  jianBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].buyNumber > 1) {
        list[parseInt(index)].buyNumber--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

        //向后端发送修改请求
        wx.request({
          url: app.globalData.urls + '/baby/shop/goods/shop-car',
          method: 'PUT',
          data: {
            shoppingCartId: list[parseInt(index)].shoppingCartId,
            buyNumber: list[parseInt(index)].buyNumber,
            username: app.globalData.username
          },
          success: function (res) {
            if (res.statusCode == 204) {
              util.order();
            }
          }
        })

      }
    }
  },
  
  //转换 编辑 或者 下单状态
  editTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  //转换 编辑 或者 下单状态
  saveTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  //感觉这个函数没什么用 saveHidden 的值由前端控制了
  getSaveHide: function () {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },

  //删除选择
  deleteSelected: function () {
    var goodsIds = [];
    var list = this.data.goodsList.list;

    goodsIds = list.filter(entity => {
      return entity.active
    }).map(entity => {
      return entity.goodsId
    });

    list = list.filter(function (curGoods) {
      return !curGoods.active;
    });
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

    //向后端发送删除请求
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/shop-car',
      method: 'DELETE',
      data: {
        goodsIds: goodsIds, 
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          this.reLoadShopCar();
          util.order();
        }
      }
    })

  },

  //去下单
  toPayOrder: function () {
    wx.showLoading();
    var that = this;
    if (this.data.goodsList.noSelect) {
      wx.hideLoading();
      return;
    }
    var activeShopList = [];
    activeShopList = that.data.goodsList.list.filter(entity => {
      return entity.active;
    });
    wx.setStorage({
      key: 'shopCarInfo-topay',
      data: activeShopList,
    });
    that.navigateToPayOrder();
    wx.hideLoading();
  },



  /**
     * 重新获取购物车数据
     */
  reLoadShopCar: function () {
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/shop-car',
      data: {
        username: app.globalData.username
      },
      success: function (res) {
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

          } else {
            wx.removeStorageSync("shopCarInfo")
          }
        } else {
          wx.removeStorageSync("shopCarInfo")
        }
      }
    })
  },


  navigateToPayOrder: function () {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=NORMAL"
    })
  }

})