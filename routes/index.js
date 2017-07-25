var express = require('express');
var path = require('path');
var controller = require('../controllers');
var router = express.Router();

var config = {
  wechat: {
    configURL: path.join(__dirname, '../config/wechat.txt'),
    appID: 'wxc701a72ba859ed22',
    appSecret: '96c4909655ad2881496d743aa957efcb',
    token: 'wxghtest' //此处公号token一致
  }
};

router.all('/', controller(config.wechat));

module.exports = router;
