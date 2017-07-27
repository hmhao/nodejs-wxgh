var fs = require('fs');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary:{	// 临时素材
    upload: prefix + 'media/upload?', // 新增
    fetch: prefix + 'media/get?' // 获取
  },
  permanent:{ // 永久素材
    upload: prefix + 'material/add_material?', // 新增媒体:如图片（image）、语音（voice）、视频（video）和缩略图（thumb）
    uploadNews: prefix + 'material/add_news?', // 新增图文
    uploadNewsPic: prefix + 'media/uploadimg?', // 新增图文消息里面的图片
    fetch: prefix + 'material/get_material?', // 获取
    del: prefix + 'material/del_material?', // 删除
    upateNews: prefix + 'material/update_news?', // 修改图文
    count: prefix + 'material/get_materialcount?', // 获取总数
    batch: prefix + 'material/batchget_material?' // 获取列表
  }
};

function Wechat(opts) {   //构造函数，用以生成实例，完成初始化工作，读写票据
  this.configURL = opts.configURL;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.fetchAccessToken()
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
Wechat.prototype.fetchAccessToken = function () {
  var that = this;
  if (this.isValidAccessToken(this)) {
    return Promise.resolve(this);
  }
  this.getAccessToken()
    .then(function (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return that.updateAccessToken();
      }
      if (that.isValidAccessToken(data)) {
        return Promise.resolve(data);
      } else {
        return that.updateAccessToken();
      }
    })
    .then(function (data) {
      that.access_token = data.access_token;
      that.expires_in = data.expires_in;
      that.saveAccessToken(JSON.stringify(data));
      return Promise.resolve(data);
    });
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

Wechat.prototype.uploadMaterial = function (type, material, permanent) {
  var that = this;
  var formData = {};
  var uploadUrl = api.temporary.upload; // 默认是上传临时素材

  if(permanent){ // 根据 permanent判断是上传临时素材还是永久素材
    uploadUrl = api.permanent.upload;
    Object.assign(formData, permanent);// 让formData兼容所有上传类型
  }

  if(type === 'pic'){ // 图文消息中的图片
    uploadUrl = api.permanent.uploadNewsPic;
  }

  if(type === 'news'){ // 如果是图文消息, material传进来是数组
    uploadUrl = api.permanent.uploadNews;
    formData = material;
  } else { // 如果是图片或视频其他类型，material是文件路径
    formData.media = fs.createReadStream(material);
  }

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
        var url = uploadUrl + 'access_token=' + data.access_token + '&type='+type;
        if(permanent){ // 永久素材需要追加access_token
          formData.access_token = data.access_token;
        }
        var options = {
          method : 'POST',
          url: url,
          json: true
        };
        options[type === 'news' ? 'body' : 'formData'] = formData;

        request(options)
          .then(function (res) {
            if (res.body) {
              resolve(res.body)
            } else {
              throw new Error('Upload material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          })
      })
  })
};
Wechat.prototype.fetchMaterial = function(mediaId, type, permanent){
  var that = this;
  var fetchUrl = api[permanent ? 'permanent': 'temporary'].fetch;// 根据 permanent判断是获取临时素材还是永久素材

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = fetchUrl + 'access_token='+ data.access_token;
        var formData = {}, options = {method: 'POST', url: url, json: true};
        if(permanent){
          formData.media_id = mediaId;
          formData.access_token = data.access_token;
          options.body = formData;
        } else {
          url += '&media_id=' + mediaId;
          if(type === 'video'){
            // 临时视频文件不支持https下载，调用该接口需http协议
            url = url.replace('https://', 'http://');
          }
        }

        // 除了图文和视频（要单独判断），其他类型返回的是url地址，通过地址拿到内容
        if(type === 'news' || type === 'video'){
          request(options)
            .then(function(res){
              if(res.body){
                resolve(res.body);
              } else {
                throw new Error('fetch material fails');
              }
            })
            .catch(function(err){
              reject(err)
            })
        } else {
          resolve(url);
        }
      })
  })
};
Wechat.prototype.deleteMaterial = function(mediaId){
  var that = this;
  var formData = {
    media_id: mediaId
  };

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.del + 'access_token='+ data.access_token;
        var options = {
          method: 'POST',
          url: url,
          body: formData,
          json: true
        };
        request(options)
          .then(function(res){
            if(res.body){
              resolve(res.body);
            } else {
              throw new Error('delete material fails');
            }
          })
          .catch(function(err){
            reject(err)
          })
      })
  })
};
Wechat.prototype.updateMaterial = function(mediaId, news){
  var that = this;
  var formData = {
    media_id: mediaId
  };

  Object.assign(formData, news);

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.upateNews + 'access_token='+ data.access_token;
        var options = {
          method:'POST',
          url: url,
          body: formData,
          json: true
        };
        request(options)
          .then(function(res){
            if(res.body){
              resolve(res.body);
            } else {
              throw new Error('update material fails');
            }
          })
          .catch(function(err){
            reject(err)
          })
      })
  })
};
Wechat.prototype.countMaterial = function(){
  var that = this;

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.count + 'access_token='+ data.access_token;

        var options = {
          method:'GET',
          url: url,
          json: true
        };
        request(options)
          .then(function(res){
            if(res.body){
              resolve(res.body);
            } else {
              throw new Error('count material fails');
            }
          })
          .catch(function(err){
            reject(err)
          })
      })
  })
};
Wechat.prototype.batchMaterial = function(opts){
  var that = this;
  var formData = {
    type: opts.type || 'image',
    offset: opts.offset || 0,
    count: opts.count || 1
  };

  return new Promise(function(resolve, reject){
    that
      .fetchAccessToken()
      .then(function(data){
        var url = api.permanent.batch + 'access_token='+ data.access_token;

        var options = {
          method: 'POST',
          url: url,
          body: formData,
          json: true
        };
        request(options)
          .then(function(res){
            if(res.body){
              resolve(res.body);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function(err){
            reject(err)
          })
      })
  })
};

module.exports = Wechat;