# koa_demo

这是一个koa 示例，这是参照[koa-rudy](https://github.com/iwfe/koa-rudy)项目开发的。主要架构和思路参照该项目文档，这里我只是介绍下我增加的部分；

## 目录
|- resource-util	
|- |- properties-to-json properties文件转成json格式的几个方法	
|- |- static-resource-util	远程拉取properties文件的处理层	

### resource-util
这是根据之前java项目处理前端静态资源加载的改写的node版本。主要的方式和逻辑跟之前一致
主要思路
- 根据环境区分本地或者远程环境，本地环境根据本地静态配置读取。
- test、beta、product环境则每分钟定时拉取远端**staticResourceConfig.properties**文件，之后每次比较该文件中的**staticResourceMD5**字段和获取的**staticResource.properties**文件的md5比较，如果不一致则也更新**staticResource.properties**文件。否则不操作。

## usage[说明]
- 在主程序中引用 static-resource-util.js中的```startLoadProperties() ```方法开始加载静态资源配置文件properties
- 在view层需要获取前端静态资源（js，css）的情况下，引用static-resource-util.js中的```getURL```方法；

