require('babel-register');

const PORT = '3000';

let resourceUtil = require("./resource-util/static-resource-util");

resourceUtil.startLoadProperties();