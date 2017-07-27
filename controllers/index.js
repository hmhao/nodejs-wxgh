const crypto = require('crypto');
const Wechat = require('./wechat');
const reply = require('./reply');
const tpl = require('./tpl');

function checkSignature (token, query) {
  let {signature,timestamp, nonce}  = query;

  /*  加密/校验流程如下： */
  //1. 将token、timestamp、nonce三个参数进行字典序排序
  let array = new Array(token, timestamp, nonce);
  array.sort();
  let str = array.toString().replace(/,/g, '');

  //2. 将三个参数字符串拼接成一个字符串进行sha1加密
  let sha1Code = crypto.createHash('sha1');
  let code = sha1Code.update(str, 'utf-8').digest('hex');

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

function getCompiled(content, message) {
  var info = {
    content: content,
    createTime: Date.now(),
    msgType: content.type || (Array.isArray(content) ? 'news' : 'text'),
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  };
  return tpl.compiled(info)
}

async function handler (ctx, next) {
  let message = ctx.wechatMsg = format(ctx.request.body.xml);
  let service = handler.get(message.MsgType);
  await service(ctx);
  ctx.status = 200;
  ctx.type = 'application/xml';
  ctx.body = getCompiled(ctx.body, message);
}
handler.types = {};
handler.get = function (type) {
  return handler.types[type] || function () {}
};
handler.set = function (type, callback) {
  handler.types[type] = callback;
};

module.exports = function (opts) {
  let wechat = new Wechat(opts);
  for (let type in reply) {
    handler.set(type, reply[type])
  }
  return async (ctx, next) => {
    var query = ctx.query;
    if (checkSignature(opts.token, query)) {
      if (ctx.method === 'GET') {
        ctx.body = query.echostr;
      } else if (ctx.method === 'POST') {
        ctx.wechatApi = wechat;
        await handler(ctx, next);
      }
    } else {
      ctx.body = 'error';
    }
  }
};
