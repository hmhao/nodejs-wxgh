const Koa = require('koa');
const logger = require('koa-logger');
const xmlParser = require('koa-xml-body');
const bodyparser = require('koa-bodyparser');
const serve = require('koa-static');
const json = require('koa-json');
const views = require('koa-views');
const onerror = require('koa-onerror');

const app = new Koa();
const index = require('./routes/index');

// error handler
onerror(app);

// global middlewares
app.use(views('views', {
  root: __dirname + '/views',
  extension: 'ejs'
}));
app.use(xmlParser()); // 必须在bodyparse前
app.use(bodyparser());
app.use(json());
app.use(logger());

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

app.use(serve(__dirname + '/public'));

// routes definition
app.use(index.routes(), index.allowedMethods());

module.exports = app;
