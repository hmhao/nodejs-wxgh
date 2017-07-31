exports.remarkUser = async function (openid, remark) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/user/info/updateremark?access_token=${access_token}`,
    method: 'POST',
    body: {
      openid,
      remark
    }
  };
  return this.request(opts, `Remark user fails`);
};
exports.fetchUser = async function (openid, lang = 'zh_CN') {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/user/info?access_token=${access_token}&openid=${openid}&lang=${lang}`
  };
  return this.request(opts, `fetch user fails`);
};
exports.fetchUsers = async function (openids = [], lang = 'zh_CN') {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/user/info/batchget?access_token=${access_token}`,
    method: 'POST',
    body: {
      user_list: openids.map(function (openid) {
        return {openid, lang};
      })
    }
  };
  return this.request(opts, `fetch users fails`);
};
exports.listUsers = async function (openid) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/user/get?access_token=${access_token}`+ (openid ? `&next_openid=${openid}` : '')
  };
  return this.request(opts, `list users fails`);
};