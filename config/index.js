var path = require('path');
var config = {
  wechat: {
    configURL: path.join(__dirname, 'wechat.txt'),
    appID: 'wxabcb2d1193161f4b',
    appSecret: 'fab92145bcb5460860968a9910f57f61',
    token: 'wxghtest' //此处公号token一致
  }
};

module.exports = config;