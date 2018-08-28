var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    provinces: [],
    citys: [],
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },
  bindCancel: function () {
    wx.navigateBack({})
  },

  //保存地址信息
  bindSave: function (e) {
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;
    if (linkMan == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (mobile == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    }
    if (this.data.selProvince == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    if (this.data.selCity == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }

    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    var districtId;
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
      districtId = '';
    } else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
    }

    if (address == "") {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false
      })
      return
    }
    if (code == "") {
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel: false
      })
      return
    }
    var apiAddid = that.data.id;
    if (!apiAddid){
      apiAddid = '';
    }
    wx.request({
      url: app.globalData.urls + '/baby/user/shipping-address/addOrUpdate',
      method: 'POST',
      data: {
        username: app.globalData.username,
        userAddressId: apiAddid,

        provinceCode: commonCityData.cityData[this.data.selProvinceIndex].id,
        cityCode: cityId,
        areaCode: districtId,

        province: commonCityData.cityData[this.data.selProvinceIndex].name,
        city: commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].name,
        area: commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].name,

        linkMan: linkMan,
        address: address,
        mobile: mobile,
        postalCode: code,
        isDefault: 'true'
      },
      success: function (res) {
        if (res.statusCode != 201) {
          // 登录错误 
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: '收货地址保存失败，请联系管理员',
            showCancel: false
          })
          return;
        }
        // 跳转到结算页面
        wx.navigateBack({})
      }
    })
  },

  //初始省市区信息，根据 level 来确定初始的信息
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts: pinkArray
      });
    }
  },

  //省份发生变化
  bindPickerProvinceChange: function (event) {
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince: selIterm.name,
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },

  //城市发生变化
  bindPickerCityChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: selIterm.name,
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },

  //最后的辖区项发生变化
  bindPickerChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },

  //事件e为已存在的一条地址信息做修改时 跳转过来的。
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    this.initCityData(1);
    var id = e.id;
    //暂时不知道事件e是做什么用的 先留下IF中的代码
    if (id) {
      // 初始化原数据
      wx.showLoading();
      wx.request({
        url: app.globalData.urls + '/baby/user/shipping-address/detail',
        data: {
          username: app.globalData.username,
          userAddressId: id
        },
        success: function (res) {
          wx.hideLoading();
          if (res.statusCode == 200) {
            that.setData({
              id: id,
              addressData: res.data,
              selProvince: res.data.province,
              selCity: res.data.city,
              selDistrict: res.data.area
            });
            //将数据绑定在输入框中
            that.setDBSaveAddressId(res.data);
            return;
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
        }
      })
    }
  },

   //将数据绑定在输入框中
  setDBSaveAddressId: function (data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceCode == commonCityData.cityData[i].id) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityCode == commonCityData.cityData[i].cityList[j].id) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.areaCode == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
  },

  selectCity: function () {
  },

  deleteAddress: function (e) {
    var that = this;
    var userAddressId = e.currentTarget.dataset.id;
    console.log(userAddressId)
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.urls + '/baby/user/shipping-address/delete',
            method: 'DELETE',
            data: {
              username: app.globalData.username,
              userAddressId: userAddressId
            },
            success: (res) => {
              wx.navigateBack({})
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //从微信读取
  readFromWx: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;

        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            let eventJ = { detail: { value: i } };
            that.bindPickerProvinceChange(eventJ);
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].name) {
                //that.data.selCityIndex = j;
                eventJ = { detail: { value: j } };
                that.bindPickerCityChange(eventJ);
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    //that.data.selDistrictIndex = k;
                    eventJ = { detail: { value: k } };
                    that.bindPickerChange(eventJ);
                  }
                }
              }
            }

          }
        }
        that.setData({
          wxaddress: res,
        });
      }
    })
  }

})