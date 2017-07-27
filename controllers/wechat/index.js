const API = require('./api_base');

API.mixin(require('./api_material'));// 素材管理接口

module.exports = API;