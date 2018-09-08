var app = getApp();
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function order() {
  wx.request({
    url: app.globalData.urls + '/baby/order/statistics',
    data: { 
      username: app.globalData.username 
    },
    success: function (res) {
      if (res.statusCode == 200) {
        
        // 购物车待购物数
        if (res.data.shopCarNumber > 0){
          wx.setTabBarBadge({
            index: 2,
            text: '' + res.data.shopCarNumber + ''
          })
        }else{
          wx.removeTabBarBadge({
            index: 2,
          })
        }



        // 待支付订单数
        if (res.data.count_id_no_pay > 0) {
          wx.setTabBarBadge({
            index: 3,
            text: '' + res.data.count_id_no_pay + ''
          })
        } else {
          wx.removeTabBarBadge({
            index: 3,
          })
        }



      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  order: order
}
