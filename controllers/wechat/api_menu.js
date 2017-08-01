exports.createMenu = async function (menu) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/menu/create?access_token=${access_token}`,
    method: 'POST',
    body: menu
  };
  return this.request(opts, `Create menu fails`);
};
exports.getMenu = async function () {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/menu/get?access_token=${access_token}`
  };
  return this.request(opts, `Get menu fails`);
};
exports.deleteMenu = async function () {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/menu/delete?access_token=${access_token}`
  };
  return this.request(opts, `Delete menu fails`);
};
exports.getMenuConfig = async function () {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/get_current_selfmenu_info?access_token=${access_token}`
  };
  return this.request(opts, `Get current menu fails`);
};
exports.addConditionalMenu = async function (menu) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/menu/addconditional?access_token=${access_token}`,
    method: 'POST',
    body: menu
  };
  return this.request(opts, `Add conditional menu fails`);
};
exports.deleteConditionalMenu = async function (menuid) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/menu/delconditional?access_token=${access_token}`,
    method: 'POST',
    body: {
      menuid
    }
  };
  return this.request(opts, `Delete conditional menu fails`);
};
exports.tryConditionalMenu = async function (user_id) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/menu/trymatch?access_token=${access_token}`,
    method: 'POST',
    body: {
      user_id
    }
  };
  return this.request(opts, `Try match conditional menu fails`);
};