const API = require('./api_base');

API.mixin(require('./api_material'));// 素材管理接口
API.mixin(require('./api_group'));// 分组管理接口
API.mixin(require('./api_user'));// 用户管理接口
API.mixin(require('./api_mass_send'));// 群发接口
API.mixin(require('./api_menu'));// 菜单接口

module.exports = API;