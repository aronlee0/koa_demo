
var fs = require('fs');
var readline = require('readline');
var http = require('http');

const ANNOTATION_G_RE = /\s*#[^\n]*/g;
const ANNOTATION_RE = /\s*#[^\n]*/;
const SPACE_H_OR_F_RE = /(^\n*)|(\n*$)/g;
const KEY_RE = /[^\s\=]*(?==)/g;
const VALUE_RE = /=[\S]*/g;

const STATIC_RESOURCE_FILE = './fileconf/staticResource.properties';
const STATIC_RESOURCE_CONFIG_FILE = './fileconf/staticResourceConfig.properties';
const STATIC_CONFIG_URL = 'http://house-test-water.oss.aliyuncs.com/resource/iwjw-pc_test/staticResourceConfig.properties';
const STATIC_URL = 'http://house-test-water.oss.aliyuncs.com/resource/iwjw-pc_test/staticResource.properties';

const LOCAL_CONFIG_DIR = './fileconf/staticResourceConfig.properties';
const LOCAL_DIR = './fileconf/staticResource.properties';


function getHttpFile(url){
    return new Promise((resolve,reject)=>{
        http.get(url,(res) => {
            var  data = "";
            res.on('data',function(d){
                data += d;
            });
            res.on("end", function(d) {
                resolve(data);
            });
        }).on('error', (e) => {
            console.log('Got Error: ${e.massage}');
            reject(e);
        });
    });
}


function getLocalFile(){
    fs.exists(path,callback);
    getHttpFile(STATIC_CONFIG_URL).then((httpData) => {
        var httpJson = {};
        let newData = httpData.replace(ANNOTATION_G_RE,"").replace(SPACE_H_OR_F_RE,"");
        var  arr = newData.split("\n");
        for(let i = 0; i < arr.length; i++){ 
            var temp = arr[i].split("="); 
            httpJson[temp[0]] = temp[1];  
        }
        // console.log(newData);
        toJson(STATIC_RESOURCE_CONFIG_FILE).then((localData)=>{
            let md5 = localData.staticResourceMD5;
            console.log(httpJson.staticResourceMD5,md5);
            if(!md5 || httpJson.staticResourceMD5 != md5){
                updateLocalProperties(newData);
            }
        });
    });
    
}
getLocalFile();
function toJson(url){
    var rl = readline.createInterface({
        input: fs.createReadStream(url),
        output: process.stdout,
        terminal: false
    });
    var  json = {};
    return new Promise((resolve,reject)=>{
        rl.on('line',function(line){
            if(!ANNOTATION_RE.test(line)){
                var  arr = line.split("=");
                json[arr[0]] = arr[1];
            }
        }).on('close',function(){
            resolve(json);
        });
    });
}

function updateLocalProperties(data){
    // data = JSON.stringify(data);
    // console.log(data);
    // fs.writeFile(LOCAL_CONFIG_DIR,data,'utf-8',(err) => {
    //     if(err) throw err;
    //     console.log('\'staticResourceConfig.properties\' has saved!');
    // })
    getHttpFile(STATIC_CONFIG_URL).then((data)=>{
        fs.writeFile(LOCAL_CONFIG_DIR,data,'utf-8',(err) => {
            if(err) throw err;
            console.log('\'staticResourceConfig.properties\' has saved!');
        });
    });
    getHttpFile(STATIC_URL).then((data)=>{
        fs.writeFile(LOCAL_DIR,data,'utf-8',(err) => {
            if(err) throw err;
            console.log('\'staticResource.properties\' has saved!');
        });
    });
}

export default {
    toJson(){
        

        fs.readFile(STATIC_RESOURCE_CONFIG_FILE,"utf8",(err,data) => {
            if(err)throw err;
            // console.log(data);
            // console.log(nodePropPlugin.toJson);
            // nodePropPlugin.toJson(data);
        });

        var rl = readline.createInterface({
            input: fs.createReadStream(STATIC_RESOURCE_FILE),
            output: process.stdout,
            terminal: false
        });
        var  json = {};
        rl.on('line',function(line){
            if(!ANNOTATION_RE.test(line)){
                var  arr = line.split("=");
                json[arr[0]] = arr[1];
            }
        }).on('close',function(line){
            console.log(json);
        });
    }
};
