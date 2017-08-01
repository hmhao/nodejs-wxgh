const path = require('path');
const Promise = require('bluebird');

const related = {};

exports.event = async function (ctx) {
  let message = ctx.wechatMsg;
  if (message.Event === 'subscribe') {
    if (message.EventKey) {
      console.log(message.FromUserName + ' 扫二维码关注：' + message.EventKey + ' ' + message.Ticket);
    }
    ctx.body = '你好，感谢你的关注！';
    console.log(message.FromUserName + ' 加入关注');
  } else if (message.Event === 'unsubscribe') {
    ctx.body = '';
    console.log(message.FromUserName + ' 取消关注');
  } else if (message.Event === 'LOCATION') {
    // 如果用户同意上报位置，用户每次打开公众号都会上报一次地理位置
    ctx.body = '您上报的地理位置是：' + message.Latitude + ',' + message.Longitude;
  } else if (message.Event === 'CLICK') {
    ctx.body = '您点击了菜单：' + message.EventKey;
  } else if (message.Event === 'SCAN') {
    ctx.body = '关注后扫描二维码：' + message.Ticket;
  } else if (message.Event === 'VIEW') {
    ctx.body = '你点击了菜单中的连接：' + message.EventKey;
  } else if (message.Event === 'scancode_push'){
    console.log('scancode_push', message.ScanCodeInfo.ScanType, message.ScanCodeInfo.ScanResult);
    ctx.body = '扫码推送事件：' + message.EventKey;
  } else if (message.Event === 'scancode_waitmsg'){
    console.log('scancode_waitmsg', message.ScanCodeInfo.ScanType, message.ScanCodeInfo.ScanResult);
    ctx.body = '扫码推送中： ' + message.EventKey;
  } else if (message.Event === 'pic_sysphoto'){
    console.log('pic_sysphoto', message.SendPicsInfo.PicList, message.SendPicsInfo.Count);
    related[message.CreateTime] = message;// 稍后将接收到的image信息关联起来
    // ctx.body = '弹出系统拍照： ' + message.EventKey;
  } else if (message.Event === 'pic_photo_or_album'){
    console.log('pic_photo_or_album', message.SendPicsInfo.PicList, message.SendPicsInfo.Count);
    related[message.CreateTime] = message;// 稍后将接收到的image信息关联起来
    // ctx.body = '弹出拍照或者相册： ' + message.EventKey;
  } else if (message.Event === 'pic_weixin'){
    console.log('pic_weixin', message.SendPicsInfo.PicList, message.SendPicsInfo.Count);
    related[message.CreateTime] = message;// 稍后将接收到的image信息关联起来
    // ctx.body = '弹出微信相册发图器：' + message.EventKey;
  } else if (message.Event === 'location_select'){
    console.log(message.SendLocationInfo.Label);
    related[message.CreateTime] = message;// 稍后将接收到的location信息关联起来
    // ctx.body = '弹出地理位置选择器： ' + message.EventKey;
  }
};

exports.text = async function (ctx) {
  let message = ctx.wechatMsg;
  let content = message.Content;
  switch (content) {
    case '1': // 回复文本消息
      ctx.body = '123';
      break;
    case '2': // 回复单条图文消息
      ctx.body = [{
        title: '王者荣耀',
        description: '王者-夏侯惇',
        picUrl: 'http://pic2.52pk.com/files/160901/7154484_151243_1_lit.jpg',
        url: 'http://pvp.qq.com/web201605/herodetail/126.shtml'
      }];
      break;
    case '3': // 回复多条图文消息
      ctx.body = [{
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
    // 临时素材
    case '4': // 回复图片消息
      var data = await ctx.wechatApi.uploadTempMaterial('image', path.join(__dirname, '../public/images/1.jpg'));
      ctx.body = {
        type: 'image',
        mediaId: data.media_id
      };
      break;
    case '5': // 回复视频消息
      var data = await ctx.wechatApi.uploadTempMaterial('video', path.join(__dirname, '../public/videos/1.mp4'));
      ctx.body = {
        type: 'video',
        title: '测试视频',
        description: '卧槽，这才叫胸肌！',
        mediaId: data.media_id
      };
      break;
    case '6': // 回复音乐消息
      var data = await ctx.wechatApi.uploadTempMaterial('image', path.join(__dirname, '../public/images/2.jpg'));
      ctx.body = {
        type: 'music',
        title: '测试音乐',
        description: '放松一下',
        musicUrl: 'http://96.f.1ting.com/5977438a/dfc6d40ae211857fccbe92694bf1ae26/zzzzzmp3/2016eMay/12X/12b_Swing/01.mp3',
        thumbMediaId: data.media_id
      };
      break;
    // 永久素材
    case '7': // 回复图片消息
      var data = await ctx.wechatApi.uploadImageMaterial(path.join(__dirname, '../public/images/2.jpg'));
      ctx.body = {
        type: 'image',
        mediaId: data.media_id
      };
      break;
    case '8': // 回复视频消息
      var data = await ctx.wechatApi.uploadVideoMaterial(
        path.join(__dirname, '../public/videos/1.mp4'),
        {type:'video', description:'{"title":"胸肌", "introduction":"太强悍的胸肌了"}'}
      );
      ctx.body = {
        type: 'video',
        title: '测试视频',
        description: '卧槽，这才叫胸肌！',
        mediaId: data.media_id
      };
      break;
    case '9': // 回复多条图文消息
      // 先传个图片拿到素材id
      var picData = await ctx.wechatApi.uploadImageMaterial(path.join(__dirname, '../public/images/2.jpg'));
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
      var data = await ctx.wechatApi.uploadNewsMaterial(media);
      // 获取图文
      var news = await ctx.wechatApi.fetchMaterial(data.media_id);
      var items = news.news_item;
      news = [];
      items.forEach(function(temp){
        news.push({
          title: temp.title,
          description: temp.digest,
          picUrl: picData.url,
          url: temp.content_source_url
        })
      });
      ctx.body = news;
      break;
    case '10': // 获取素材总数和素材列表
      var counts = await ctx.wechatApi.countMaterial();
      console.log(JSON.stringify(counts));
      var lists = await Promise.all([
        ctx.wechatApi.batchMaterial('image', 0, 10),
        ctx.wechatApi.batchMaterial('video', 0, 10),
        ctx.wechatApi.batchMaterial('voice', 0, 10),
        ctx.wechatApi.batchMaterial('news', 0, 10)
      ]);
      console.log(JSON.stringify(lists));
      ctx.body = '到终端查看素材统计数据！';
      break;
    // 用户管理
    case '11':
      var groupName = 'wechat';
      var groups = await ctx.wechatApi.fetchGroups();
      console.log('分组列表：', groups);
      var filterGroup = groups.groups.filter(function (g) {
        return g.name === groupName
      });
      if (!filterGroup.length) {
        var group = await ctx.wechatApi.createGroup(groupName);
        console.log(`新分组${groupName}：`, group);
        await ctx.wechatApi.updateGroup(group.group.id, 'weixin');
        console.log('更新列表：', await ctx.wechatApi.fetchGroups());
        await ctx.wechatApi.deleteGroup(group.group.id);
        console.log('删除列表：', await ctx.wechatApi.fetchGroups());
      }

      var myGroup = await ctx.wechatApi.checkGroup(message.FromUserName);
      console.log('查看自己的分组', myGroup);

      filterGroup = groups.groups.filter(function (g) {
        return g.id === myGroup.groupid && myGroup.groupid !== 0
      });
      if (filterGroup.length) {
        ctx.body = `你所在的分组是${filterGroup[0].name}！`;
      } else {
        myGroup = await ctx.wechatApi.moveGroup(message.FromUserName, 2);
        ctx.body = `你原来没有组，现移动到星标组！`;
      }
      break;
    case '12':
      var groupNum = 2;
      var groups = [];
      for (let i = 0, group; i < groupNum; i++) {
        group = await ctx.wechatApi.createGroup('wechat' + i);
        groups.push(group.group.id)
      }
      console.log(`创建分组：`, await ctx.wechatApi.fetchGroups());
      await ctx.wechatApi.deleteGroup(groups);
      console.log('删除列表：', await ctx.wechatApi.fetchGroups());
      ctx.body = `分组Test！`;
      break;
    case '13':
      var user = await ctx.wechatApi.fetchUser(message.FromUserName);
      console.log(user);
      var users = await ctx.wechatApi.fetchUsers([message.FromUserName], 'en');
      console.log(users);
      ctx.body = JSON.stringify(users);
      break;
    case '14':
      var userlist = await ctx.wechatApi.listUsers();
      console.log(userlist);

      ctx.body = JSON.stringify(userlist.total);
      break;
    // 群发
    case '15':
      var mpnews = {
        media_id: 'rkI4MQq3qtIHSm1-kw0kla07odKb1037jVXII6d0Xrw'
      };
      var mpnData = await ctx.wechatApi.sendByGroup('mpnews', mpnews, 2);
      console.log(mpnData);

      /*var text = {
        content: 'Test!!!'
      };
      var textData = await ctx.wechatApi.sendByGroup('text', text, 2);
      console.log(textData);*/

      ctx.body = 'Yeah!';
      break;
    case '16':
      var mpnews = {
        media_id: 'rkI4MQq3qtIHSm1-kw0kla07odKb1037jVXII6d0Xrw'
      };
      var mpnData = await ctx.wechatApi.previewMass('mpnews', mpnews, 'o5fPNv63aWjsPDsg610m9faND6so');
      console.log(mpnData);

      ctx.body = 'Yeah!';
      break;
    default:
      ctx.body = '你说的 ' + content + ' 太复杂了';
  }
};

exports.image = async function (ctx) {
  let message = ctx.wechatMsg;
  if (related[message.CreateTime]) {
    Object.assign(message, related[message.CreateTime]);
    delete related[message.CreateTime];
    if (message.Event === 'pic_sysphoto'){
      ctx.body = '弹出系统拍照： ' + message.EventKey;
    } else if (message.Event === 'pic_photo_or_album') {
      ctx.body = '弹出拍照或者相册： ' + message.EventKey;
    } else if (message.Event === 'pic_weixin'){
      ctx.body = '弹出微信相册发图器：' + message.EventKey;
    }
  }
};

exports.location = async function (ctx) {
  let message = ctx.wechatMsg;
  if (related[message.CreateTime]) {
    Object.assign(message, related[message.CreateTime]);
    delete related[message.CreateTime]
  }
  ctx.body = `弹出地理位置选择器： ${message.EventKey}\n地理：${message.Label}\n位置：${message.Location_X} ${message.Location_Y}`;
};