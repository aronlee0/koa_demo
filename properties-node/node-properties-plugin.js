
var fs = require('fs');
var readline = require('readline');
const ANNOTATION_RE = /\s*#[^\n]*/g;
const KEY_RE = /[^\s\=]*(?==)/g;
const VALUE_RE = /=[\S]*/g;




let a = {
    getValue: (key) => {
        var re = /$/;
    },
    toJson: (stream) =>{
        let str = stream;
        //去掉注释
        str = str.replace(ANNOTATION_RE,'');

        

        // let keyArr = KEY_RE.exec(str);
        // let keyArr = str.match(KEY_RE);
        // if(!keyArr || keyArr.length <1)return;
        // let newArr = new Array();
        // for(let i = 0; i < keyArr.length; i++){
        //     if(keyArr[i])newArr.push(keyArr[i]);
        // }

        // let valueArr = str.match(VALUE_RE);
        // if(!valueArr || valueArr.length <1)return;
        // let newArr2 = new Array();
        // for(let i = 0; i < valueArr.length; i++){
        //     if(valueArr[i])newArr2.push(valueArr[i]);
        // }

        // console.log(newArr2);
        // }
    }
};
module.exports = a;