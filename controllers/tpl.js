var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var tpl = fs.readFileSync(path.join(__dirname, '../views/tpl.ejs'), {encoding: 'utf8'});

module.exports = {
  compiled: ejs.compile(tpl)
};