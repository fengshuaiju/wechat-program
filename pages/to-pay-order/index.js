//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，

    curAddressData: {},
    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券

    groupBookingId: null,
    cutDownId: null,
    ordersType: null //该type为创建订单用
  },

  onShow: function() {
    var that = this;
    var shopList = [];
    //砍价下单
    if ("buykj" == that.data.orderType) {
      if (shopList.length == 0) {
        var buykjInfoMem = wx.getStorageSync('buykjInfo');
        if (buykjInfoMem && buykjInfoMem.shopList) {
          shopList = buykjInfoMem.shopList
        }
        that.setData({
          cutDownId: buykjInfoMem.shopList[0].cutDownId,
          ordersType: 'CUT_DOWN'
        });
      }
    }
    //拼团下单
    else if ("buyPT" == that.data.orderType) {
      if (shopList.length == 0) {
        var buyPTInfoMem = wx.getStorageSync('PingTuanInfo');
        if (buyPTInfoMem && buyPTInfoMem.shopList) {
          shopList = buyPTInfoMem.shopList
        }
        that.setData({
          groupBookingId: buyPTInfoMem.shopList[0].pingtuanId,
          ordersType: 'GROUP_BOOKING'
        });
      }
    }

    //立即购买下单 //TODO 此处可能要设置 砍价ID 后期进行设置
    else if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
      that.setData({
        ordersType: 'NORMAL'
      });
    }

    //购物车下单
    else {
      shopList = wx.getStorageSync('shopCarInfo-topay');
      console.log(shopList);
      that.setData({
        ordersType: 'SHOPPING_CART'
      });
    }
    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  onLoad: function(e) {
    var that = this;
    if (app.globalData.iphone == true) {
      that.setData({
        iphone: 'iphone'
      })
    }
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  createOrder: function(e) {
    wx.showLoading();
    var that = this;
    var loginToken = app.globalData.username // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      username: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark,
      couponId: "",
      addressId: "",
      groupBookingId: that.data.groupBookingId,
      cutDownId: that.data.cutDownId,
      orderType: that.data.ordersType
    };

    //检测是否写了收货地址
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
    }

    //获取收货地址ID
    if (that.data.curAddressData) {
      postData.addressId = that.data.curAddressData.userAddressId;
    } else {
      wx.hideLoading();
      wx.showModal({
        title: '错误',
        content: '请先设置您的收货地址！',
        showCancel: false
      })
    }

    //填写红包的ID
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.couponId;
    }
    wx.request({
      url: app.globalData.urls + '/baby/order/create',
      method: 'POST',
      data: postData, // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode == 201){
          that.clearData();
        }
        if (res.statusCode != 201) {
          wx.showModal({
            title: '错误',
            content: '订单创建失败',
            showCancel: false
          })
          return;
        }


        //清空购物车数据
        // if (e && "buyNow" != that.data.orderType) {
        //   wx.removeStorageSync('shopCarInfo');
        //   wx.removeStorageSync('buykjInfo');
        //   wx.removeStorageSync('PingTuanInfo');
        // }


        //TODO 暂时不推送消息
        // 配置模板消息推送
        // var postJsonString = {};
        // postJsonString.keyword1 = { value: res.data.data.dateAdd, color: '#173177' }
        // postJsonString.keyword2 = { value: res.data.data.amountReal + '元', color: '#173177' }
        // postJsonString.keyword3 = { value: res.data.data.orderNumber, color: '#173177' }
        // postJsonString.keyword4 = { value: '订单已关闭', color: '#173177' }
        // postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' }
        // app.sendTempleMsg(res.data.data.id, -1,
        //   app.siteInfo.closeorderkey, e.detail.formId,
        //   'pages/index/index', JSON.stringify(postJsonString));
        // postJsonString = {};
        // postJsonString.keyword1 = { value: '您的订单已发货，请注意查收', color: '#173177' }
        // postJsonString.keyword2 = { value: res.data.data.orderNumber, color: '#173177' }
        // postJsonString.keyword3 = { value: res.data.data.dateAdd, color: '#173177' }
        // app.sendTempleMsg(res.data.data.id, 2,app.siteInfo.deliveryorderkey, e.detail.formId,
        //   'pages/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString)) + '&share=1';


        wx.redirectTo({
          url: "/pages/to-pay-order/success/index?order=" + res.data.data.orderNumber + "&money=" + res.data.data.amountReal + "&id=" + res.data.data.id
        });
      }

    })
  },


  clearData: function() {
    var that = this;
    //如果是购物车购物，清空现在的购物车并重新获取购物车数据
    if ("SHOPPING_CART" == that.data.ordersType) {
      wx.removeStorageSync('shopCarInfo');
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
              if (res.data.length != 0) {
                var shopCarInfo = [];
                shopCarInfo = res.data;
                for (let i = 0; i < shopCarInfo.length; i++) {
                  // 构建购物车信息
                  var shopCarMap = {};
                  shopCarMap.goodsId = shopCarInfo[i].goodsId;
                  //商品图片
                  shopCarMap.pic = shopCarInfo[i].mainPic;
                  //商品名称
                  shopCarMap.name = shopCarInfo[i].goodsName;
                  //商品规格组合ID
                  shopCarMap.propertyChildIds = shopCarInfo[i].propertiesJoint;
                  //商品副信息
                  shopCarMap.label = shopCarInfo[i].label;
                  //选中的商品价格
                  shopCarMap.price = shopCarInfo[i].price;
                  //要购买的件数
                  shopCarMap.buyNumber = shopCarInfo[i].buyNumber;

                  totalBuy = totalBuy + shopCarInfo[i].buyNumber;
                  list.push(shopCarMap);
                }

                shopCarInfo.shopList = list;
                shopCarInfo.shopNum = totalBuy;
                // 写入本地存储
                wx.setStorage({
                  key: "shopCarInfo",
                  data: shopCarInfo
                })
              }
            }
          }
        })
      }, 1500)
    }
  },

  //获取默认收货地址
  initShippingAddress: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/user/shipping-address/default',
      data: {
        username: app.globalData.username
      },
      success: (res) => {
        if (res.statusCode == 200) {
          if (res.data) {
            that.setData({
              curAddressData: res.data,
              isNeedLogistics: 1
            });
          } else {
            wx.showModal({
              title: '错误',
              content: '请先设置您的收货地址！',
              showCancel: false
            })
          }
        }
        that.processYunfei();
      }
    })
  },

  //计算运费以及组合订单信息
  processYunfei: function() {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var allGoodsPrice = 0;

    //遍历商品信息，是否需要运费，暂时想法此处要调用接口，根据购买的商品的 件数 和 金额 来确定该商品是否需要运费
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];

      allGoodsPrice += carShopBean.price * carShopBean.buyNumber;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }

      //获取邀请人的ID
      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }

      goodsJsonStrTmp +=
        '{"goodsId":' + carShopBean.goodsId +
        ',"buyNumber":' + carShopBean.buyNumber +
        ',"propertyChildIds":"' + carShopBean.propertyChildIds +
        '","shoppingCartId":"' + carShopBean.shoppingCartId +
        '", "inviterId":"' + inviter_id +
        '", "goodsLabel":"' + carShopBean.label +
        '"}';
      goodsJsonStr += goodsJsonStrTmp;
    }
    goodsJsonStr += "]";

    //设置数据
    that.setData({
      goodsJsonStr: goodsJsonStr,
      allGoodsPrice: allGoodsPrice,
      allGoodsAndYunPrice: allGoodsPrice + 5,
      yunPrice: 5
    });
    //获取我的红包
    that.getMyCoupons();
  },
  //计算运费结束

  //添加地址
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },

  //选择地址
  selectAddress: function() {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },

  //获取我的红包
  getMyCoupons: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/discounts/my',
      data: {
        username: app.globalData.username
      },
      success: function(res) {
        if (res.statusCode == 200) {
          // 过滤符合条件的红包，可以把过滤转到服务端做
          var coupons = res.data.filter(entity => {
            return entity.requirementConsumption <= that.data.allGoodsAndYunPrice;
          });
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },

  //更换优惠券时触发
  bindChangeCoupon: function(e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    this.setData({
      youhuijine: this.data.coupons[selIndex].amountOfMoney,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})