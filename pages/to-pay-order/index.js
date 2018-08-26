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
    curCoupon: null // 当前选择使用的优惠券
  },

  onShow: function () {
    // console.log(this.data.orderType)
    var that = this;
    var shopList = [];
    //砍价下单
    if ("buykj" == that.data.orderType) {
      if (shopList.length == 0) {
        var buykjInfoMem = wx.getStorageSync('buykjInfo');
        if (buykjInfoMem && buykjInfoMem.shopList) {
          shopList = buykjInfoMem.shopList
        }
      }
    }
    //拼团下单
    else if ("buyPT" == that.data.orderType) {
      if (shopList.length == 0) {
        var buyPTInfoMem = wx.getStorageSync('PingTuanInfo');
        if (buyPTInfoMem && buyPTInfoMem.shopList) {
          shopList = buyPTInfoMem.shopList
        }
      }
    }
    //立即购买下单
    else if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
    }
    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  onLoad: function (e) {
    console.log("eeeeeeeeeeeeeee")
    console.log(e)
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  //获取地域信息ID
  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder: function (e) {
    
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
      addressId: ""
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
    if (that.data.curCoupon) {
      postData.addressId = that.data.curAddressData.userAddressId;
    }else{
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
        if (res.statusCode != 201) {
          wx.showModal({
            title: '错误',
            content: '订单创建失败',
            showCancel: false
          })
          return;
        }

        //清空购物车数据
        if (e && "buyNow" != that.data.orderType) {
          wx.removeStorageSync('shopCarInfo');
          wx.removeStorageSync('buykjInfo');
          wx.removeStorageSync('PingTuanInfo');
        }

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

  //获取默认收货地址
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/user/shipping-address/default',
      data: {
        username: app.globalData.username
      },
      success: (res) => {
        if (res.statusCode == 200) {
          if (res.data){
            that.setData({
              curAddressData: res.data,
              isNeedLogistics: 1
            });
          }else{
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
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var allGoodsPrice = 0;

    //遍历商品信息，是否需要运费，暂时想法此处要调用接口，根据购买的商品的 件数 和 金额 来确定该商品是否需要运费
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];

      allGoodsPrice += carShopBean.price * carShopBean.number;

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
      ',"number":' + carShopBean.number + 
      ',"propertyChildIds":"' + carShopBean.propertyChildIds + 
      '", "inviterId":' + inviter_id + 
      '", "groupBookingId":' + carShopBean.pingtuanId + 
      '", "cutDownId":' + 0 //此处暂时先把砍价ID处理为0，写到砍价的时候应该进行修改
      +'}';
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
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },

  //选择地址
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },

  //获取我的红包
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/discounts/my',
      data: {
        username: app.globalData.username
      },
      success: function (res) {
        console.log(res.data);
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
  bindChangeCoupon: function (e) {
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