const fs = require('fs');

exports.uploadTempMaterial = async function (type, material) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/media/upload?access_token=${access_token}&type=${type}`,
    method: 'POST',
    formData: {
      media: fs.createReadStream(material)
    }
  };
  return this.request(opts, `Upload temp material fails`);
};
exports.fetchTempMaterial = async function(type, mediaId){
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/media/get?access_token=${access_token}&media_id=${mediaId}`
  };
  if(type === 'video'){
    // 临时视频文件不支持https下载，调用该接口需http协议
    opts.url = opts.url.replace('https://', 'http://');
  }
  return this.request(opts, `Fetch temp material fails`);
};

exports.uploadMaterial = async function (type, material, description) {
  let { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/add_material?access_token=${access_token}&type=${type}`,
    method: 'POST',
    formData: Object.assign({
      media: fs.createReadStream(material)
    }, description)
  };
  return this.request(opts, `Upload material fails, type is ${type}`);
};
['image', 'voice', 'thumb'].forEach(function (type) {
  let method = 'upload' + type[0].toUpperCase() + type.substring(1) + 'Material';
  exports[method] = async function (material) {
    return this.uploadMaterial(type, material);
  };
});
exports.uploadVideoMaterial = async function (material, description) {
  this.uploadMaterial('video', material, description);
};
exports.uploadNewsMaterial = async function (news) {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/add_news?access_token=${access_token}`,
    method: 'POST',
    formData: news
  };
  return this.request(opts, `Upload news material fails`);
};
exports.uploadNewsPicMaterial = async function (material) {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/media/uploadimg?access_token=${access_token}`,
    method: 'POST',
    formData: {
      media: fs.createReadStream(material)
    }
  };
  return this.request(opts, `Upload news pic material fails`);
};
exports.fetchMaterial = async function (mediaId) {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/get_material?access_token=${access_token}`,
    method: 'POST',
    formData: {
      media_id: mediaId
    }
  };
  return this.request(opts, `Fetch material fails`);
};
exports.deleteMaterial = async function (mediaId) {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/del_material?access_token=${access_token}`,
    method: 'POST',
    formData: {
      media_id: mediaId
    }
  };
  return this.request(opts, `Delete material fails`);
};
exports.updateNewsMaterial = async function (mediaId, news) {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/update_news?access_token=${access_token}`,
    method: 'POST',
    formData: Object.assign({
      media_id: mediaId
    }, news)
  };
  return this.request(opts, `Update news material fails`);
};
exports.countMaterial = async function () {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/get_materialcount?access_token=${access_token}`
  };
  return this.request(opts, `Count material fails`);
};
exports.batchMaterial = async function (type, offset, count) {
  const { access_token } = await this.fetchAccessToken();
  let opts = {
    url: `${this.prefix}/material/batchget_material?access_token=${access_token}`,
    method: 'POST',
    formData: {
      type: type,
      offset: offset,
      count: count
    }
  };
  return this.request(opts, `Batch ${type} material fails`);
};