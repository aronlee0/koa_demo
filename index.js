require('babel-register');
var http = require('http');
var app = require('./bin/app');
var config = require('./config/conf')(process.env['NODE_ENV']);
var server = http.createServer(app.callback());
console.log('server listen port: ' + config.port);
server.listen(config.port);
// let resourceUtil = require("./resource-util/static-resource-util");

// resourceUtil.startLoadProperties();