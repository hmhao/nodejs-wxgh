var path = require('path');
var config = {
  wechat: {
    configURL: path.join(__dirname, 'wechat.txt'),
    appID: 'wxc701a72ba859ed22',
    appSecret: '96c4909655ad2881496d743aa957efcb',
    token: 'wxghtest' //此处公号token一致
  }
};

module.exports = config;