var tpl = require('./tpl');

function getCompiled(content, message) {
  var info = {
    content: content,
    createTime: Date.now(),
    msgType: 'text',
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  };
  return tpl.compiled(info)
}

function send(res, content) {
  res.status(200);
  res.type('application/xml');
  res.send(content);
}

exports.event = function (req, res, next) {
  var message = req.wechat;
  if(message.Event === 'subscribe'){
    send(res, getCompiled('你好，感谢你的关注！', message));
    console.log(message.FromUserName + ' 加入关注');
  } else if(message.Event === 'unsubscribe') {
    send(res, '');
    console.log(message.FromUserName + ' 取消关注');
  } else{
    send(res, 'ok');
  }
};