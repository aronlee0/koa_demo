import fs from "fs";
import readline from "readline";
import http from "http";

import crypto from "fs";
import _ from "lodash";

const C_W_D = process.cwd();
const NODE_ENV = process.env['NODE_ENV'].toLowerCase() || "dev";
const config = require(C_W_D + '/config/conf')(NODE_ENV);

const ANNOTATION_G_RE = /\s*#[^\n]*/g;
const SPACE_H_OR_F_RE = /(^\s)|(\s$)/g;
const END_OF_EACH_LINE_RE = /(\S)[\s]*\n[\s]*(\S)/g;

const CONFIG_NAME = "staticConfig.properties";
const STATIC_RESOURCE_NAME = "staticResource.properties";
const STATIC_CONFIG_NAME = "staticResourceConfig.properties";
const STATIC_PATH = "/assets/resource/";

class PropertiesUtil{
    custructor(){
        this.isAutoReloadStaticResource = false;
        this.staticResourceConfigURL = "";
        this.staticResourceURL = "";
        this.tmpStaticResourceMD5 = "";
        this.staticResourceMD5 = "";
        this.staticResourceJSON = {};
        this.__TIMER = {};
        if(fs.existsSync(this.getLocalUrl(STATIC_RESOURCE_NAME))){
            this.staticResourceJSON = this.loadLocalPropertiesToJson(this.getLocalUrl(STATIC_RESOURCE_NAME));
        }
    }
    getLocalUrl(fileName){
        return C_W_D + STATIC_PATH + fileName;
    }
    getLocalUrl(fileName){
        return C_W_D + STATIC_PATH + fileName;
    }
    parseBool(str){
        return typeof str === "string" && str.toLowerCase() === "true";
    }
    isEmpty(str){
        return !str || (typeof str === 'string' && !str.trim());
    }
    isEmptyObj(obj){
        return typeof obj === "object" && _.isEmpty(obj);
    }
    loadStaticResourceConfig(){
        let self = this;
        let localPh = self.getLocalUrl(STATIC_CONFIG_NAME);
        self.downloadToLocal(self.staticResourceConfigURL,localPh).then(()=>{
            let newJson = self.loadLocalPropertiesToJson(localPh);
            self.tmpStaticResourceMD5 = newJson["staticResourceMD5"];
            self.isAutoReloadStaticResource = self.parseBool(newJson["autoReload"]);
            // if(!isEmpty(self.staticResourceMD5) && self.staticResourceMD5 === self.tmpStaticResourceMD5){
            //     self.isAutoReloadStaticResource = false;
            // }
            console.log("load file " + STATIC_CONFIG_NAME + " finish.");
        }).catch((err)=>{
            console.log(err) ;
        });
    }
    loadStaticResource(){
        let self = this;
        if(!self.isAutoReloadStaticResource && !self.isEmptyObj(this.staticResourceJSON)){
            console.log("load file " + STATIC_RESOURCE_NAME + " suspended.");
            return;
        }
        let localPath = self.getLocalUrl(STATIC_RESOURCE_NAME);
        if(self.isAutoReloadStaticResource || !fs.existsSync(localPath)){
            self.downloadToLocal(self.staticResourceURL,localPath).then(()=>{
                this.staticResourceJSON = self.loadLocalPropertiesToJson(localPath);
                console.log("load file " + STATIC_RESOURCE_NAME + " finish.");
            });
        }
        // getMD5(localPath).then((md5)=>{
        //     console.log(md5);
        // });
    }
    getMD5(url){
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
    getHttpFile(url){
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
    downloadToLocal(url, local){
        let self = this;
        return new Promise((resolve,reject)=>{
            self.getHttpFile(url).then((data) => {
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
    loadLocalPropertiesToJson (path){
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
    startLoadProperties(){
        let self = this;
        let staticConfigs = config.staticConfigs;
        if(!staticConfigs){
            throw new Error("staticConfigs error!");
        }
        self.staticResourceConfigURL = staticConfigs["staticResourceConfigURL"];
        self.staticResourceURL = staticConfigs["staticResourceURL"];
        // contentUrlPre = staticConfigs["contentUrlPre"];

        if (self.isEmpty(self.staticResourceConfigURL) || self.isEmpty(self.staticResourceURL)) {
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
            self.loadStaticResourceConfig();
            self.loadStaticResource();
            function setTimeLoad(){
                self.__TIMER = setTimeout(() => {
                    self.loadStaticResourceConfig();
                    self.loadStaticResource();
                    setTimeLoad();
                },60*1000);
            }
            setTimeLoad();
        }
    }
    getURL(key){
        if(this.isEmptyObj(this.staticResourceJSON))return;
        if(!key)return "";
        if(NODE_ENV !== "prod" && arguments[1]){
            return arguments[1] + key;
        }else{
            if(NODE_ENV === "dev")return self.staticResourceURL + key;
            return this.staticResourceJSON[key] || "";
        }  
    }
}  
module.exports = new PropertiesUtil();