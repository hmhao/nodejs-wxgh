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
    case '1': // 回复文本消息
      res.body = '123';
      next();
      break;
    case '2': // 回复单条图文消息
      res.body = [{
        title: '王者荣耀',
        description: '王者-夏侯惇',
        picUrl: 'http://pic2.52pk.com/files/160901/7154484_151243_1_lit.jpg',
        url: 'http://pvp.qq.com/web201605/herodetail/126.shtml'
      }];
      next();
      break;
    case '3': // 回复多条图文消息
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
    // 临时素材
    case '4': // 回复图片消息
      req.wechatApi.uploadMaterial('image', path.join(__dirname, '../public/images/1.jpg'))
        .then(function (data) {
          res.body = {
            type: 'image',
            mediaId: data.media_id
          };
          next()
        });
      break;
    case '5': // 回复视频消息
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
    case '6': // 回复音乐消息
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
    // 永久素材
    case '7': // 回复图片消息
      req.wechatApi.uploadMaterial('image', path.join(__dirname, '../public/images/2.jpg'), {type: 'image'})
        .then(function (data) {
          res.body = {
            type: 'image',
            mediaId: data.media_id
          };
          next()
        });
      break;
    case '8': // 回复视频消息
      req.wechatApi.uploadMaterial('video', path.join(__dirname, '../public/videos/1.mp4'),
          {type:'video', description:'{"title":"胸肌", "introduction":"太强悍的胸肌了"}'})
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
    case '9': // 回复多条图文消息
      // 先传个图片拿到素材id
      req.wechatApi.uploadMaterial('image', path.join(__dirname, '../public/images/2.jpg'), {})
        .then(function (picData) {
          // 组装图文消息
          var media = {
            articles:[{
              title: '小程序',
              thumb_media_id: picData.media_id,
              author: 'huozw',
              digest: '没有摘要',
              show_cover_pic: 1,
              content: '新增永久图文素材',
              content_source_url: 'https://github.com'
            }, {
              title: '凤凰新闻',
              thumb_media_id: picData.media_id,
              author: 'huozw',
              digest: '凤凰新闻',
              show_cover_pic: 1,
              content: '新增永久图文素材',
              content_source_url: 'http://www.ifeng.com/'
            }]
          };
          // 上传图文
          req.wechatApi.uploadMaterial('news', media, {})
            .then(function (data) {
              // 获取图文
              req.wechatApi.fetchMaterial(data.media_id,'news',{})
                .then(function (news) {
                  var items = news.news_item;
                  var news = [];
                  items.forEach(function(temp){
                    news.push({
                      title: temp.title,
                      description: temp.digest,
                      picUrl: picData.url,
                      url: temp.content_source_url
                    })
                  });
                  res.body = news;
                  next();
                })
            })
        });
      break;
    case '10': // 获取素材总数和素材列表
      req.wechatApi.countMaterial()
        .then(function (counts) {
          console.log(JSON.stringify(counts));
          Promise.all([
            req.wechatApi.batchMaterial({
                type:'image',
                offset: 0,
              count: 10
            }),
            req.wechatApi.batchMaterial({
              type:'video',
              offset: 0,
              count: 10
            }),
            req.wechatApi.batchMaterial({
              type:'voice',
              offset: 0,
              count: 10
            }),
            req.wechatApi.batchMaterial({
              type:'news',
              offset: 0,
              count: 10
            })
          ]).then(function (lists) {
            console.log(JSON.stringify(lists));
            res.body = '到终端查看素材统计数据！';
            next()
          });
        });
      break;
    default:
      res.body = '你说的 ' + content + ' 太复杂了';
      next()
  }
};