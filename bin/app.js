import koa from "koa";
import responseTime from "koa-response-time";
import compress from "koa-compress";


import resourceUtil from "../resource-util/static-resource-util";
import middlewares from "../middlewares";


// resourceUtil.startLoadProperties();
var debug = require('debug')('http')
  , http = require('http')
  , name = 'My App';

// fake app

debug('booting %s', name);

http.createServer(function(req, res){
  debug(req.method + ' ' + req.url);
  res.end('hello\n');
}).listen(4444, function(){
  debug('listening');
});

var app = new koa();
// x-response-time

app.use(responseTime());

// compression

app.use(compress());


app.use(middlewares.error());

app.use((ctx)=>{
    ctx.body = "hello";
});

export default app;