require('babel-register');

const PORT = '3000';

//线上环境
// const STATIC_CONFIG_URL = 'http://iwjw-resource.oss-cn-hangzhou-internal.aliyuncs.com/iwjw-pc/staticResourceConfig.properties';
// const STATIC_URL = 'http://iwjw-resource.oss-cn-hangzhou-internal.aliyuncs.com/iwjw-pc/staticResource.properties';
//test环境
const STATIC_CONFIG_URL = 'http://house-test-water.oss.aliyuncs.com/resource/iwjw-pc_test/staticResourceConfig.properties';
const STATIC_URL = 'http://house-test-water.oss.aliyuncs.com/resource/iwjw-pc_test/staticResource.properties';

var koa = require('koa');
var app = koa();

var http = require('http');
var  fs = require('fs');
var readline = require('readline');
//获取staticResourceConfig.properties
// http.get(STATIC_CONFIG_URL,(res) => {
//     var  data = "";
//     res.on('data',function(d){
//         data += d;
//     });
//     res.on("end", function() {
//         fs.writeFile('./fileconf/staticResourceConfig.properties',data,'utf-8',(err) => {
//             if(err) throw err;
//             console.log('It\'s saved!');
//         })
//     });
// }).on('error', (e) => {
//     console.log('Got Error: ${e.massage}');
// });
//获取staticResource.properties
// http.get(STATIC_URL,(res) => {
//     var  data = "";
//     res.on('data',function(d){
//         data += d;
//     });
//     res.on("end", function() {
//         fs.writeFile('./fileconf/staticResource.properties',data,'utf-8',(err) => {
//             if(err) throw err;
//             console.log('It\'s saved!');
//         })
//     });
// }).on('error', (e) => {
//     console.log('Got Error: ${e.massage}');
// });

const STATIC_RESOURCE_FILE = './fileconf/staticResource.properties';
const STATIC_RESOURCE_CONFIG_FILE = './fileconf/staticResourceConfig.properties';
var nodePropPlugin = require('./properties-node/node-properties-plugin.js');

fs.readFile(STATIC_RESOURCE_CONFIG_FILE,"utf8",(err,data) => {
    if(err)throw err;
    // console.log(data);
    // console.log(nodePropPlugin.toJson);
    nodePropPlugin.toJson(data);
});

var rl = readline.createInterface({
    input: fs.createReadStream(STATIC_RESOURCE_FILE),
    output: process.stdout,
    terminal: false
});
var  json = {};
rl.on('line',function(line){
    var  arr = line.split("=");
    // console.log(arr);
    json[arr[0]] = arr[1];
}).on('close',function(line){
    console.log(json);
});

// fs.readFile(STATIC_RESOURCE_CONFIG_FILE,"utf8",(err,data) => {
//     if(err)throw err;
//     // console.log(data);
//     // console.log(nodePropPlugin.toJson);
//     nodePropPlugin.toJson(data);
// });
















app.use(function *() {
  this.body = 'hello koa-middlewares';
});
// app.use(function *(){ console.log('http request is listening ' + PORT) });
app.listen('3000');