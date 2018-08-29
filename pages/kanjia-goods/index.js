//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    autoplay: true,
    interval: 10000,
    duration: 500,
    goodsDetail:{},
    swiperCurrent: 0,  
    hasMoreSelect:false,
    selectSize:"选择规格：",
    shopNum:0,
    hideShopPopup:true,
    buyNumber:0,
    buyNumMin:1,
    buyNumMax:0,
    favicon:0,
    curGoodsId:'',
    propertyChildIds:"",
    propertyChildNames:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    shopType: "CUT_DOWN",//购物类型，加入购物车或立即购买，默认为加入购物车
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    }, 
    wxlogin: true,
    stores: 0,
    cutDownPrice: 0,
    alreadyHasCutDown: false,
    cutDownId: null
  },

  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },

  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
        wx.hideTabBar();
      }
    }, 1000)
  },

  onLoad: function (e) {
    //如果是被邀请来的，记下邀请人ID
    if (e.inviter_id) {
      wx.setStorage({
        key: 'inviter_id_' + e.id,
        data: e.inviter_id
      })
    }
    var that = this;
    if (e.share) { that.setData({ share: e.share }); }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }

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
    
    //获取商品详情
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/detail',
      data: {
        goodsId: e.id
      },
      success: function(res) {
        that.setData({
          goodsDetail: res.data,
          buyNumMax:res.data.basicInfo.stores,
          buyNumber:(res.data.basicInfo.stores>0) ? 1: 0,
          stores: res.data.basicInfo.stores,
          curGoodsId: e.id
        });
        if (res.data.basicInfo.videoId) {
          that.getVideoSrc(res.data.basicInfo.videoId);
        }
        WxParse.wxParse('article', 'html', res.data.basicInfo.content, that, 5);
      }
    })

    //检测我是否已经有发起的砍价，如果有直接跳转到砍价详情页面
    wx.request({
      url: app.globalData.urls + '/baby/cutdown/check-exist',
      data: {
        goodsId: e.id,
        username: app.globalData.username
      },
      success: function (res) {
        if (res.statusCode  == 200){
          if (JSON.stringify(res.data) != "{}") {
            that.setData({
              alreadyHasCutDown: res.data.exist,
              cutDownId: res.data.cutDownId
            });
          }
        }
      }
    })

    //查询该商品的评价列表
    this.reputation(e.id);
  },
  
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
     this.setData({  
        hideShopPopup: false 
    })  
  },

  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
     this.setData({  
        hideShopPopup: true 
    })  
  },

  //购买数量增加和减少
  numJianTap: function() {
     if(this.data.buyNumber > this.data.buyNumMin){
        var currentNum = this.data.buyNumber;
        currentNum--; 
        this.setData({  
            buyNumber: currentNum
        })  
     }
  },
  numJiaTap: function() {
     if(this.data.buyNumber < this.data.buyNumMax){
        var currentNum = this.data.buyNumber;
        currentNum++ ;
        this.setData({  
            buyNumber: currentNum
        })  
     }
  },

  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function(e) {
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
        url: app.globalData.urls +'/baby/shop/goods/price',
        data: {
          goodsId: that.data.goodsDetail.basicInfo.goodsId,
          propertyChildIds: propertyChildIds.substring(0, propertyChildIds.length - 1)
        },
        success: function (res) {
          that.setData({
            propertyChildIds: propertyChildIds.substring(0, propertyChildIds.length - 1),
            propertyChildNames: propertyChildNames.substring(0, propertyChildNames.length - 1),
            buyNumMax: that.data.stores,
            buyNumber: (that.data.stores > 0) ? 1 : 0,
            cutDownPrice: res.data.CUT_DOWN
          });
        }
      })
    }

    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit:canSubmit
    })  
  },
  
	/**
	  * 立即购买
	  */
  propertiesCheck:function(){
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel:false
      })
      return;
    }    
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel:false
      })
      return;
    }
  },

  //分享要被砍的商品
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/kanjia-goods/index?id=' + this.data.goodsDetail.basicInfo.goodsId + '&share=1',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //获取商品评价
  reputation: function (goodsId) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/baby/shop/goods/reputation',
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

  //获取video
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

  //跳转到主页
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },

  //已经发起过砍价，直接跳转到详情页面
  myKanjia: function(){
    var that = this;
    wx.navigateTo({
      url: "/pages/kanjia/index?cutDownId=" + that.data.cutDownId + "&joiner=" + app.globalData.username + "&goodsId=" + that.data.curGoodsId + "&kanjiashare=" + false
    })
  },

  //检测规格等是否选中，选中后 组件购买信息 并跳转到砍价页面
  goKanjia: function () {
    var that = this;
    that.propertiesCheck();

    if (!that.data.canSubmit) {
      return;
    }

    wx.request({
      url: app.globalData.urls + '/baby/cutdown/create',
      method: 'POST',
      data: {
        goodsId: that.data.curGoodsId,
        username: app.globalData.username,
        buyNumber: that.data.buyNumber,
        propertyChildIds: that.data.propertyChildIds,
        goodsLabel: that.data.propertyChildNames
      },
      success: function (res) {
        if (res.statusCode == 201) {
          wx.navigateTo({
            url: "/pages/kanjia/index?cutDownId=" + res.data.cutDownId + "&joiner=" + app.globalData.username + "&goodsId=" + that.data.curGoodsId + "&kanjiashare=" + res.data.isNew
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

  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },

  //需要用自己的做出替换 TODO
  // userlogin: function (e) {
  //   var that = this;
  //   var iv = e.detail.iv;
  //   var encryptedData = e.detail.encryptedData;
  //   wx.login({
  //     success: function (wxs) {
  //       wx.request({
  //         url: app.globalData.urls + '/user/wxapp/register/complex',
  //         data: {
  //           code: wxs.code,
  //           encryptedData: encryptedData,
  //           iv: iv
  //         },
  //         success: function (res) {
  //           if (res.data.code != 0) {
  //             wx.showModal({
  //               title: '温馨提示',
  //               content: '需要您的授权，才能正常使用哦～',
  //               showCancel: false,
  //               success: function (res) { }
  //             })
  //           } else {
  //             that.setData({ wxlogin: true })
  //             app.login();
  //             wx.showToast({
  //               title: '授权成功',
  //               duration: 2000
  //             })
  //             app.globalData.usinfo = 1;
  //           }
  //         }
  //       })
  //     }
  //   })
  // },
})
