const EventEmitter = require('events').EventEmitter;
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const request = Promise.promisify(require('request'));

class Wechat extends EventEmitter{
  constructor(opts) {
    super();
    this.configURL = opts.configURL;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.prefix = 'https://api.weixin.qq.com/cgi-bin';
    this.defaults = {
      json: true,
      timeout: 60000, // 60秒超时
    };
    this.inited = false;
    this.fetchAccessToken();
  }
  isValidAccessToken (data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }
    return Date.now() < data.expires_in;
  }
  async fetchAccessToken () {
    if (this.isValidAccessToken(this)) {
      return this;
    }
    let data = await this.getAccessToken();
    try {
      data = JSON.parse(data);
    } catch (e) {
      return this.updateAccessToken();
    }
    if (this.isValidAccessToken(data)) {
      return this.saveAccessToken(data);
    } else {
      return this.updateAccessToken();
    }
  };
  async getAccessToken () {
    let content = await fs.readFileAsync(this.configURL, {encoding: 'utf8'});
    return content
  };
  async saveAccessToken (data) {
    let content = JSON.stringify(data);
    await fs.writeFileAsync(this.configURL, content);
    this.access_token = data.access_token;
    this.expires_in = data.expires_in;
    if (!this.inited) {
      this.inited = true;
      this.emit('inited');
    }
    return data;
  };
  async updateAccessToken () {
    let url = `${this.prefix}/token?grant_type=client_credential&appid=${this.appID}&secret=${this.appSecret}`;
    let data = await this.request({url: url});
    let expire_in = Date.now() + (data.expires_in - 20) * 1000; // 考虑到网络延时等情况，需要提前刷新
    data.expires_in = expire_in;
    console.log('更新AccessToken');
    data = await this.saveAccessToken(data);
    return data;
  };
  async request (opts, errstr) {
    let options = {};
    Object.assign(options, this.defaults, opts);
    let res = await request(options);
    let data = res.body;
    if (data && data.errcode) {
      let errmsg = data.errmsg + (errstr ? '\nat ' + errstr : '');
      let err = new Error(errmsg);
      err.name = 'WeChatAPIError';
      err.code = data.errcode;
      throw err;
    }
    return data;
  }
}

Wechat.mixin = function (obj) {
  for (let key in obj) {
    if (Wechat.prototype.hasOwnProperty(key)) {
      throw new Error('Don\'t allow override existed prototype method. method: '+ key);
    }
    Wechat.prototype[key] = obj[key];
  }
};

module.exports = Wechat;