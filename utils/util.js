/**
 * 将豆瓣电影评分转换为星级数组 1 代表星星，0 代表没有星星
 * @return {[array]}
 */
function convertToStarsArray(stars) {
  var num = stars.toString().substring(0,1);
  var array = [];
  for (var i = 1; i <= 5; i++) {
    if (i <= num) {
      array.push(1);
    } else {
      array.push(0);
    }
  }

  return array;
}

function http(url, callBack) {
  wx.request({
    url: url,
    method: 'GET',
    header: {
      "Content-Type": "json"
    },
    success: function (res) {
      callBack(res.data);
    },
    fail: function (error) {
      console.log(error);
    }
  });
}

module.exports = {
  convertToStarsArray: convertToStarsArray,
  http: http
}