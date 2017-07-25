var path = require('path');

exports.event = function (req, res, next) {
  var message = req.wechatMsg;
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
  var message = req.wechatMsg;
  var content = message.Content;
  switch (content) {
    case '1':
      res.body = '123';
      next();
      break;
    case '2':
      res.body = [{
        title: '王者荣耀',
        description: '王者-夏侯惇',
        picUrl: 'http://pic2.52pk.com/files/160901/7154484_151243_1_lit.jpg',
        url: 'http://pvp.qq.com/web201605/herodetail/126.shtml'
      }];
      next();
      break;
    case '3':
      res.body = [{
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
      next();
      break;
    case '4':
      req.wechatApi.uploadMaterial('image', path.join(__dirname, '../public/images/1.jpg'))
        .then(function (data) {
          res.body = {
            type: 'image',
            mediaId: data.media_id
          };
          next()
        });
      break;
    case '5':
      req.wechatApi.uploadMaterial('video', path.join(__dirname, '../public/videos/1.mp4'))
        .then(function (data) {
          res.body = {
            type: 'video',
            title: '测试视频',
            description: '卧槽，这才叫胸肌！',
            mediaId: data.media_id
          };
          next()
        });
      break;
    case '6':
      req.wechatApi.uploadMaterial('image', path.join(__dirname, '../public/images/2.jpg'))
        .then(function (data) {
          res.body = {
            type: 'music',
            title: '测试音乐',
            description: '放松一下',
            musicUrl: 'http://96.f.1ting.com/5977438a/dfc6d40ae211857fccbe92694bf1ae26/zzzzzmp3/2016eMay/12X/12b_Swing/01.mp3',
            thumbMediaId: data.media_id
          };
          next()
        });
      break;
    default:
      res.body = '你说的 ' + content + ' 太复杂了';
      next()
  }
};