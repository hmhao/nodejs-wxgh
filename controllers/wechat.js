var fs = require('fs');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential'
};

function Wechat(opts) {   //构造函数，用以生成实例，完成初始化工作，读写票据
  var that = this;
  this.configURL = opts.configURL;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;

  this.getAccessToken()
    .then(function (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return that.updateAccessToken();
      }
      if (that.isValidAccessToken(data)) {
        that.access_token = data.access_token;
        that.expires_in = data.expires_in;
        that.saveAccessToken(JSON.stringify(data));
      } else {
        return that.updateAccessToken();
      }
    });
}
Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = Date.now();

  if (now < expires_in) {
    return true;
  } else {
    return false;
  }
};
Wechat.prototype.getAccessToken = function () {
  var configURL = this.configURL;
  return new Promise(function (resolve, reject) {
    fs.readFile(configURL, {encoding: 'utf8'}, function (err, content) {
      if (err) reject(err);
      else resolve(content);
    });
  })
};
Wechat.prototype.saveAccessToken = function (content) {
  var configURL = this.configURL;
  return new Promise(function (resolve, reject) {
    fs.writeFile(configURL, content, function (err) {
      if (err) reject(err);
      else resolve();
    });
  })
};
Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
  return new Promise(function (resolve, reject) {
    request({url: url, json: true})
      .then(function (res) {
        var data = res.body;
        var now = Date.now();
        var expire_in = now + (data.expires_in - 20) * 1000; // 考虑到网络延时等情况，需要提前刷新
        data.expires_in = expire_in;
        console.log('更新AccessToken');
        resolve(data)
      })
  })
};

module.exports = Wechat;