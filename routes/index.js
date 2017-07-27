const router = require('koa-router')();
const config = require('../config');
const controller = require('../controllers');

router.all('/', controller(config.wechat));

module.exports = router;
