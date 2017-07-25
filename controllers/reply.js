exports.event = function (req, res, next) {
  var message = req.wechat;
  if (message.Event === 'subscribe') {
    if (message.EventKey) {
      console.log(message.FromUserName + ' 扫二维码关注：' + message.EventKey + ' ' + message.Ticket);
    }
    res.body = '你好，感谢你的关注！';
    console.log(message.FromUserName + ' 加入关注');
  } else if (message.Event === 'unsubscribe') {
    res.body = '';
    console.log(message.FromUserName + ' 取消关注');
  } else if (message.Event === 'LOCATION') {
    res.body = '您上报的地理位置是：' + message.Latitude + ',' + message.Longitude;
  } else if (message.Event === 'CLICK') {
    res.body = '您点击了菜单：' + message.EventKey;
  } else if (message.Event === 'SCAN') {
    res.body = '关注后扫描二维码：' + message.Ticket;
  } else if (message.Event === 'VIEW') {
    res.body = '你点击了菜单中的连接：' + message.EventKey;
  }
  next()
};

exports.text = function (req, res, next) {
  var message = req.wechat;
  var content = message.Content;
  var reply = '你说的 ' + content + ' 太复杂了';
  switch (content) {
    case '1':
      reply = '123';
      break;
    case '2':
      reply = 234;
      break;
    case '3':
      reply = [{
        title: '王者荣耀',
        description: '王者-夏侯惇',
        picUrl: 'http://pic2.52pk.com/files/160901/7154484_151243_1_lit.jpg',
        url: 'http://pvp.qq.com/web201605/herodetail/126.shtml'
      }];
      break;
    case '4':
      reply = [{
        title: '王者荣耀',
        description: '王者-夏侯惇',
        picUrl: 'http://pic2.52pk.com/files/160901/7154484_151243_1_lit.jpg',
        url: 'http://pvp.qq.com/web201605/herodetail/126.shtml'
      },{
        title: '亡者农药',
        description: '亡者-胜利',
        picUrl: 'http://www.9669.com/uploadfile/2016/0127/20160127023811879.jpg',
        url: 'http://pvp.qq.com/'
      }];
      break;
  }
  res.body = reply;
  next()
};