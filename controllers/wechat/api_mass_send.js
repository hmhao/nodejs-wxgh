exports.sendByGroup = async function (type, message, groupid) {
  let { access_token } = await this.fetchAccessToken();
  let form = {
    filter: {},
    msgtype: type,
    [type]: message
  };
  if (!groupid) {
    form.filter.is_to_all = true
  } else {
    form.filter.is_to_all = false;
    form.filter.group_id = groupid;
  }
  let opts = {
    url: `${this.prefix}/message/mass/sendall?access_token=${access_token}`,
    method: 'POST',
    body: form
  };
  return this.request(opts, `Send ${type} messge by group fails`);
};
exports.sendByOpenid = async function (type, message, openids) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/message/mass/send?access_token=${access_token}`,
    method: 'POST',
    body: {
      touser: openids,
      msgtype: type,
      [type]: message
    }
  };
  return this.request(opts, `Send ${type} messge by openid fails`);
};
exports.previewMass = async function (type, message, openids) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/message/mass/preview?access_token=${access_token}`,
    method: 'POST',
    body: {
      touser: openids,
      msgtype: type,
      [type]: message
    }
  };
  return this.request(opts, `Preview mass fails`);
};
exports.deleteMass = async function (messageid) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/message/mass/delete?access_token=${access_token}`,
    method: 'POST',
    body: {
      msg_id: messageid
    }
  };
  return this.request(opts, `Delete mass fails`);
};
exports.checkMass = async function (messageid) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/message/mass/get?access_token=${access_token}`,
    method: 'POST',
    body: {
      msg_id: messageid
    }
  };
  return this.request(opts, `Delete mass fails`);
};
