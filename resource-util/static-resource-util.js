import fs from "fs";
import readline from "readline";
import http from "http";
import crypto from "fs";

const C_W_D = process.cwd();
const NODE_ENV = process.env['NODE_ENV'].toLowerCase() || "dev";
const config = require(C_W_D + '/config/conf')(NODE_ENV);


const ANNOTATION_G_RE = /\s*#[^\n]*/g;
const SPACE_H_OR_F_RE = /(^\s)|(\s$)/g;
const END_OF_EACH_LINE_RE = /(\S)[\s]*\n[\s]*(\S)/g;


var staticResourceConfigURL;
var staticResourceURL;
// var contentUrlPre;
var isAutoReloadStaticResource = false;
var tmpStaticResourceMD5 = "";
var staticResourceMD5 = "";

const CONFIG_NAME = "staticConfig.properties";
const STATIC_RESOURCE_NAME = "staticResource.properties";
const STATIC_CONFIG_NAME = "staticResourceConfig.properties";
const STATIC_PATH = "/assets/resource/";


var __TIMER;

var staticResourceJSON = {};
if(fs.existsSync(getLocalUrl(STATIC_RESOURCE_NAME))){
    staticResourceJSON = loadLocalPropertiesToJson(getLocalUrl(STATIC_RESOURCE_NAME));
}

function getLocalUrl(fileName){
    let prefix = C_W_D + STATIC_PATH;
    return prefix + fileName;
}
function parseBool(str){
    if(typeof str !== "string")return false;
    if(str.toLowerCase() === "true"){
        return true;
    }else{
        return false;
    } 
}
function isEmpty(str){
    if(!str)return true;
    else if(typeof str === 'string' && !(str.trim())){
        return true;
    }else{
        return false;
    }
}
function isEmptyObj(obj){
    if(typeof obj !== "object")return false;
    let isEmpty = true;
    for(var i in obj){
        isEmpty = false;
        break;
    }
    return isEmpty;
}

function loadStaticResourceConfig(){
    let localPh = getLocalUrl(STATIC_CONFIG_NAME);
    download2Local(staticResourceConfigURL,localPh).then(()=>{
        let newJson = loadLocalPropertiesToJson(localPh);
        tmpStaticResourceMD5 = newJson["staticResourceMD5"];
        
        isAutoReloadStaticResource = parseBool(newJson["autoReload"]);
        // if(!isEmpty(staticResourceMD5) && staticResourceMD5 === tmpStaticResourceMD5){
        //     isAutoReloadStaticResource = false;
        // }
        console.log("load file " + STATIC_CONFIG_NAME + " finish.");
    }).catch((err)=>{
        console.log(err) ;
    });
}

function loadStaticResource(){
    if(!isAutoReloadStaticResource && !isEmptyObj(staticResourceJSON)){
        console.log("load file " + STATIC_RESOURCE_NAME + " suspended.");
        return;
    }
    let localPath = getLocalUrl(STATIC_RESOURCE_NAME);
    if(isAutoReloadStaticResource || !fs.existsSync(localPath)){
        download2Local(staticResourceURL,localPath).then(()=>{
            staticResourceJSON = loadLocalPropertiesToJson(localPath);
            console.log("load file " + STATIC_RESOURCE_NAME + " finish.");
        });
    }
    // getMD5(localPath).then((md5)=>{
    //     console.log(md5);
    // });
}

function getMD5(url){
    return new Promise((resolve,reject) => {
        if(!fs.existsSync(url)){
            reject();
            throw new Error("got md5 fail: file is not exists");
        }
        var rs = fs.ReadStream(url);
        var hash = crypto.createHash("md5");
        let data = "";
        let str = "";
        rs.on('data',(d)=>{
            data += d;
        });
        rs.on('end',()=>{
            str = data.replace(ANNOTATION_G_RE,"").replace(SPACE_H_OR_F_RE,"").replace(END_OF_EACH_LINE_RE,"$1, $2");
            str = "{" + str + "}";
            fs.writeFileSync("./test.txt",str,"utf8",(err)=>{
                if(err)throw new Error(err);
                console.log('write test.txt finish');
            });
            // console.log(str);
            hash.update(str);
            let md5 = hash.digest('hex');
            resolve(md5);
        });
        rs.on('error',(e)=>{
            reject();
            throw new Error(e);
        })
    });
}

function getHttpFile(url){
    if(!url){
        throw new Error('remote properties url is wrong');
    }
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
            throw new Error(e);
            reject(e);
        });
    });
}
/**
 * 下载文件至本地
 * 
 * @param 远程url
 * @param 本地路径
 */
function download2Local(url, local){
    return new Promise((resolve,reject)=>{
        getHttpFile(url).then((data) => {
            fs.writeFile(local,data,'utf-8',(err) => {
                if(err) {
                    reject(err);
                }else{
                    resolve(data);
                    // console.log(' "' + url + '"' + ' has saved to " ' + local + '!"');
                }
            });
        });
    });
    
}

function loadLocalPropertiesToJson (path){
    let jsonObj = {};
    if(!fs.existsSync(path))return jsonObj;
    let str = fs.readFileSync(path,'utf8');
    str = str.replace(ANNOTATION_G_RE,"").split("\n");
    str.forEach(function(e) {
        let arr;
        e = e.trim();
        if(e){
            arr = e.split("=");
            jsonObj[arr[0]] = arr[1];
        }
    });
    return jsonObj;
}

export function startLoadProperties(){
    let staticConfigs = config.staticConfigs;
    if(!staticConfigs){
        throw new Error("staticConfigs error!");
    }
    staticResourceConfigURL = staticConfigs["staticResourceConfigURL"];
    staticResourceURL = staticConfigs["staticResourceURL"];
    // contentUrlPre = staticConfigs["contentUrlPre"];

    if (isEmpty(staticResourceConfigURL) || isEmpty(staticResourceURL)) {
        throw Error("staticConfig properties error!");
    }

    //初始化静态目录
    if(!fs.existsSync(C_W_D + STATIC_PATH)){
        let a = STATIC_PATH.replace(/(^\/)|(\/$)/g,"").split("/");
        if(a.length === 1){
            fs.mkdirSync(a[0]);
        }else{
            let str = a[0];
            for(let i = 0; i < a.length; i++){
                fs.mkdirSync(str);
                str = str + '/' + a[ i + 1];
            }
        }
    }
    // 开发环境使用本地静态文件
    if (NODE_ENV !== "dev") {
        // 每一分钟定时装载staticResourceConfig任务
        loadStaticResourceConfig();
        loadStaticResource();
        function setTimeLoad(){
            __TIMER = setTimeout(() => {
                loadStaticResourceConfig();
                loadStaticResource();
                setTimeLoad();
            },60*1000);
        }
        setTimeLoad();
    }
}

export function initJsonData(){
    let propPth = getLocalUrl(STATIC_RESOURCE_NAME);
    if(!fs.existsSync(propPth)){
        startLoadProperties();
    }else{
        staticResourceJSON = loadLocalPropertiesToJson(propPth);
    }
}

export function getURL(key){
    if(isEmptyObj(staticResourceJSON))return;
    if(!key)return "";
    if(NODE_ENV !== "prod" && arguments[1]){
        return arguments[1] + key;
    }else{
        if(NODE_ENV === "dev")return staticResourceURL + key;
        return staticResourceJSON[key] || "";
    }  
}