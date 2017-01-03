// require('babel-register');
// var http = require('http');
// var app = require('./bin/app');
// var config = require('./config/conf')(process.env['NODE_ENV']);
// var server = http.createServer(app.callback());
// console.log('server listen port: ' + config.port);
// server.listen(config.port);

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