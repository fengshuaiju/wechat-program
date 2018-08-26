//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var util = require('../../utils/util.js')

Page({
  data: {
    autoplay: true,
    interval: 10000,
    duration: 500,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择规格：",
    selectSizePrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    favicon: 0,
    selectptPrice: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    wxlogin: true,
    sharecode: true,
    sharebox: true,
    stores: 0
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (e) {
    var that = this;

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
          var id = dict.i;
          var vid = dict.u;
          var sid = dict.s;
          that.setData({
            id: id
          })
          if (vid) {
            wx.setStorage({
              key: 'inviter_id_' + id,
              data: vid
            })
          }
          if (sid) { that.setData({ share: sid }); }
        }
      }
    }
    if (!e.scene) { //链接进入
      if (e.inviter_id) {
        wx.setStorage({
          key: 'inviter_id_' + e.id,
          data: e.inviter_id
        })
      }
      if (e.share) { that.setData({ share: e.share }); }
      that.setData({
        id: e.id
      })
    }

    //获取机型
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }

    //获取logo
    wx.request({
      url: app.globalData.urls + '/baby/banner/top-logo',
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            toplogo: res.data.picUrl,
            topname: wx.getStorageSync('mallName')
          });
        }
      }
    })

    //该商品是不是喜欢的商品
    this.getfav();

    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })

    //商品详情
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/detail',
      data: {
        goodsId: that.data.id
      },
      success: function (res) {
        var selectSizeTemp = "";
        if (res.data.properties) {
          for (var i = 0; i < res.data.properties.length; i++) {
            selectSizeTemp = selectSizeTemp + " " + res.data.properties[i].name;
          }
          that.setData({
            hasMoreSelect: true,
            selectSize: that.data.selectSize + selectSizeTemp,
            selectSizePrice: res.data.basicInfo.minPrice,
            selectptPrice: res.data.basicInfo.pingtuanPrice
          });
        }
        if (res.data.basicInfo.videoId) {
          that.getVideoSrc(res.data.basicInfo.videoId);
        }
        that.setData({
          goodsDetail: res.data,
          selectSizePrice: res.data.basicInfo.minPrice,
          buyNumMax: res.data.basicInfo.stores,
          buyNumber: (res.data.basicInfo.stores > 0) ? 1 : 0,
          selectptPrice: res.data.basicInfo.pingtuanPrice,
          stores: res.data.basicInfo.stores
        });
        WxParse.wxParse('article', 'html', res.data.basicInfo.content, that, 5);

        //检测该商品是否支持拼团，若支持拼团获取拼团信息
        if (res.data.basicInfo.pingtuan){
          that.getPingtuaninfo();
          that.getPingList();
        }
 
      }
    });
    this.reputation(that.data.id);
  },

  //拼团价格等信息
  getPingtuaninfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/group-booking/info',
      data: {
        goodsId: that.data.goodsDetail.basicInfo.goodsId
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            pingtuan: res.data
          });
        }
      }
    })
  },

  //已经拼团列表
  getPingList: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/group-booking/list',
      data: {
        goodsId: that.data.goodsDetail.basicInfo.goodsId,
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            pingList: res.data
          });
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i].username == app.globalData.username) {
              that.setData({
                ptuanCt: true
              });
            }
          }
        }
      }
    })
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },

  //一键开团，先存储开团信息，此时的开团信息为 INIT 成功开团后为 IN_PROGRESS 完成拼团后为 FINISHED
  pingtuan: function () {
    var that = this;

    wx.request({
      url: app.globalData.urls + '/baby/group-booking/open',
      method: 'POST',
      data: {
        username: app.globalData.username,
        goodsId: that.data.goodsDetail.basicInfo.goodsId
      },
      success: function (res) {
        if (res.statusCode == 201) {
          that.setData({
            pingtuanOpenId: res.data.groupBookingId,
            shopType: "pingtuan"
          });
          that.bindGuiGeTap();
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
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },

  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function (e) {
    var that = this;
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].childsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].childsCurGoods[j].detailId + ":";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].childsCurGoods[j].name + " ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }

    // 计算当前价格
    if (canSubmit) {
      wx.request({
        url: app.siteInfo.url + app.siteInfo.subDomain + '/baby/shop/goods/price',
        data: {
          goodsId: that.data.goodsDetail.basicInfo.goodsId,
          propertyChildIds: propertyChildIds.substring(0, propertyChildIds.length-1),
          shopType: that.data.shopType
        },
        success: function (res) {
          that.setData({
            selectSizePrice: res.data.price,
            propertyChildIds: propertyChildIds.substring(0, propertyChildIds.length-1),
            propertyChildNames: propertyChildNames,
            buyNumMax: that.data.stores,
            buyNumber: (that.data.stores > 0) ? 1 : 0,
            selectptPrice: res.data.price
          });
        }
      })
    }

    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  /**
  * 加入购物车
  */
  addShopCar: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
	/**
	  * 立即购买
	  */
  buyNow: function () {
    var that = this;
    if (that.data.goodsDetail.properties && !that.data.canSubmit) {
      wx.hideLoading();
      if (!that.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      that.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (that.data.buyNumber < 1) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      //组建立即购买信息
      var buyNowInfo = that.buliduBuyNowInfo();
      // 写入本地存储
      wx.setStorage({
        key: "buyNowInfo",
        data: buyNowInfo
      })
      that.closePopupTap();

      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }, 1000);
    wx.showLoading({
      title: '商品准备中...',
    })

  },
  /**
	  * 购买开团商品
	  */
  buyPingtuan: function () {
    var that = this;
    if (that.data.goodsDetail.properties && !that.data.canSubmit) {
      wx.hideLoading();
      if (!that.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      that.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (that.data.buyNumber < 1) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      //组建立即购买信息
      var buyNowInfo = that.bulidupingTuanInfo();
      // 写入本地存储
      wx.setStorage({
        key: "PingTuanInfo",
        data: buyNowInfo
      })
      that.closePopupTap();
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyPT"
      })
    }, 1000);
    wx.showLoading({
      title: '准备拼团中...',
    })
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;

    shopCarMap.label = this.data.propertyChildNames;
    //价格
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
	/**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },

  //构建拼团信息
  bulidupingTuanInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.goodsId;
    //拼团ID
    shopCarMap.pingtuanId = this.data.pingtuanOpenId;
    //商品图片
    shopCarMap.pic = this.data.goodsDetail.basicInfo.mainPic;
    //商品名称
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    //商品规格组合ID
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    //商品副信息
    shopCarMap.label = this.data.propertyChildNames;
    //选中的商品价格
    shopCarMap.price = this.data.selectptPrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    //要购买的件数
    shopCarMap.number = this.data.buyNumber;
    //物流信息-----
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    //还是物流----
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    //商品重量----
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },

  //分享商品
  onShareAppMessage: function () {
    var that = this;
    that.setData({ sharebox: true })
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + app.globalData.uid + '&share=1',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //评价
  reputation: function (goodsId) {
    var that = this;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/baby/shop/goods/reputation',
      data: {
        goodsId: goodsId
      },
      success: function (res) {
        if (res.statusCode == 200) {
          //console.log(res.data.data);
          that.setData({
            reputation: res.data
          });
        }
      }
    })
  },

  //检查该商品是否是喜欢的商品
  getfav: function () {
    //console.log(e)
    var that = this;
    var id = that.data.id
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/fav/check',
      data: {
        goodsId: that.data.id,
        token: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode == 200) {
          if (res.data.fav){
            that.setData({
                favicon: 1
              });
          }
        }
      }
    })
  },

  //添加喜欢的商品
  fav: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/add',
      data: {
        goodsId: this.data.goodsDetail.basicInfo.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            image: '../../images/active.png',
            duration: 2000
          })
          that.setData({
            favicon: 1
          });
        }
      }
    })
  },
  // 取消喜欢的商品
  del: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/delete',
      data: {
        goodsId: this.data.goodsDetail.basicInfo.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            image: '../../images/error.png',
            duration: 2000
          })
          that.setData({
            favicon: 0
          });
        }
      }
    })
  },
  getVideoSrc: function (videoId) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/media/video/detail',
      data: {
        videoId: videoId
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            videoMp4Src: res.data.data.fdMp4
          });
        }
      }
    })
  },
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },
  //去参团
  addPingTuan: function (e) {
    var id = e.currentTarget.dataset.id;
    var pid = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: "/pages/pingtuan/index?id=" + id + "&uid=" + pid + "&gid=" + this.data.goodsDetail.basicInfo.id
    })
  },
  //查看我发起的拼团详情
  goPingtuanTap: function () {
    wx.navigateTo({
      url: "/pages/pingtuan/index?username=" + app.globalData.username + "&goodsId=" + this.data.goodsDetail.basicInfo.goodsId
        + "&groupBookingId=" + this.data.goodsDetail.basicInfo.goodsId
      // url: "/pages/pingtuan/index?id=" + this.data.ptuanCt + "&username=" + app.globalData.username + "&goodsId=" + this.data.goodsDetail.basicInfo.goodsId
    })
  },
  onPullDownRefresh: function (e) {
    var that = this;
    // that.getPingtuaninfo();
    // that.getPingList();
    wx.stopPullDownRefresh();
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
      // that.getPingtuaninfo();
      // that.getPingList();
    }, 1000)
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
            }
          }
        })
      }
    })
  },
  getShareBox:function(){
    this.setData({sharebox: false})
  },
  getcode: function () {
    var that = this;
    wx.showLoading({
      title: '生成中...',
    })
    wx.request({
      url: app.globalData.urls + '/qrcode/wxa/unlimit',
      data: {
        scene: "i=" + that.data.goodsDetail.basicInfo.id + ",u=" + app.globalData.uid + ",s=1",
        page: "pages/goods-details/index",
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.downloadFile({
            url: res.data.data,
            success: function (res) {
              wx.hideLoading()
              that.setData({
                codeimg: res.tempFilePath,
                sharecode: false,
                sharebox: true
              });
            }
          })
        }
      }
    });
  },
  savecode: function () {
    var that = this;
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
      sharecode: true,
    })
  },
  closeshare: function () {
    this.setData({
      sharebox: true,
      sharecode: true
    })
  },
})
