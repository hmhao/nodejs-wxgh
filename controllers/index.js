var crypto = require('crypto');
var Wechat = require('./wechat');
var reply = require('./reply');

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
  var message = req.wechat = format(req.body.xml);
  var callback = handler.get(message.MsgType);
  callback(req, res, next);
}
handler.types = {};
handler.get = function (type) {
  return handler.types[type] || function () {}
};
handler.set = function (type, callback) {
  handler.types[type] = callback;
};

module.exports = function (opts) {
  var wechat = new Wechat(opts);
  for (var type in reply) {
    handler.set(type, reply[type])
  }
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
