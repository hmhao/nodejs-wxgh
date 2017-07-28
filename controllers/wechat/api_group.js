const Promise = require('bluebird');

exports.createGroup = async function (name) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/groups/create?access_token=${access_token}`,
    method: 'POST',
    body: {
      group: {name}
    }
  };
  return this.request(opts, `Create group fails`);
};
exports.fetchGroups = async function () {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/groups/get?access_token=${access_token}`
  };
  return this.request(opts, `Fetch group fails`);
};
exports.checkGroup = async function (openid) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/groups/getid?access_token=${access_token}`,
    method: 'POST',
    body: {
      openid
    }
  };
  return this.request(opts, `Check group fails`);
};
exports.updateGroup = async function (groupid, name) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/groups/update?access_token=${access_token}`,
    method: 'POST',
    body: {
      group: {
        id: groupid,
        name
      }
    }
  };
  return this.request(opts, `Update group fails`);
};
exports.moveGroup = async function (openids, groupid) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/groups/members/${Array.isArray(openids)?'batch':''}update?access_token=${access_token}`,
    method: 'POST',
    body: {
      [Array.isArray(openids)?'openid_list':'openid']: openids,
      to_groupid: groupid
    }
  };
  return this.request(opts, `Move group fails`);
};
exports.deleteGroup = async function (groupids) {
  let { access_token } = await this.fetchAccessToken();
  if (!Array.isArray(groupids)) {
    groupids = [groupids]
  }
  let queue = [];
  groupids.forEach((groupid) => {
    let opts = {
      url: `${this.prefix}/groups/delete?access_token=${access_token}`,
      method: 'POST',
      body: {
        group: {
          id: groupid
        }
      }
    };
    queue.push(this.request(opts, `Delete group ${groupid} fails`));
  });
  return Promise.all(queue)
};