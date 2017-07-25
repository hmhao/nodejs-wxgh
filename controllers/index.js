var crypto = require('crypto');
var Wechat = require('./wechat');

function checkSignature (token, query) {
  var signature = query.signature;
  var timestamp = query.timestamp;
  var nonce = query.nonce;

  /*  加密/校验流程如下： */
  //1. 将token、timestamp、nonce三个参数进行字典序排序
  var array = new Array(token, timestamp, nonce);
  array.sort();
  var str = array.toString().replace(/,/g, '');

  //2. 将三个参数字符串拼接成一个字符串进行sha1加密
  var sha1Code = crypto.createHash('sha1');
  var code = sha1Code.update(str, 'utf-8').digest('hex');

  //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  return code === signature
}

function format (data) {
  var result = {};
  if (typeof data === 'object') {
    for (var key in data) {
      if (!(data[key] instanceof Array) || data[key].length === 0) {
        continue;
      }
      if (data[key].length === 1) {
        var val = data[key][0];
        if (typeof val === 'object') {
          result[key] = format(val);
        } else {
          result[key] = (val || '').trim();
        }
      } else {
        result[key] = [];
        data[key].forEach(function (item) {
          result[key].push(format(item));
        });
      }
    }
    return result;
  } else {
    return data;
  }
}

function handler (req, res, next) {
  var data = format(req.body.xml);
  if(data.MsgType  === 'event'){
    if(data.Event === 'subscribe'){
      res.status(200);
      res.type('application/xml');
      res.send('<xml>'+
        '<ToUserName><![CDATA['+ data.FromUserName +']]></ToUserName>'+
        '<FromUserName><![CDATA['+ data.ToUserName +']]></FromUserName>'+
        '<CreateTime>'+Date.now()+'</CreateTime>'+
        '<MsgType><![CDATA[text]]></MsgType>'+
        '<Content><![CDATA[你好，感谢你的关注！]]></Content>'+
        '</xml>');
    } else {
      res.send('ok');
    }
  }
}

module.exports = function (opts) {
  var wechat = new Wechat(opts);
  return function (req, res, next) {
    var query = req.query;
    if (checkSignature(opts.token, query)) {
      if (req.method === 'GET') {
        res.send(query.echostr);
      } else if (req.method === 'POST') {
        handler(req, res, next);
      }
    } else {
      res.send('error');
    }
  }
};
