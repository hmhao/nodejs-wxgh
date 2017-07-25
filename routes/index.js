var express = require('express');
var config = require('../config');
var controller = require('../controllers');
var router = express.Router();

router.all('/', controller(config.wechat));

module.exports = router;
