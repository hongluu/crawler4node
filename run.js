const fs = require("fs")
const log4js = require('log4js');

log4js.configure({
    appenders: { web_crawler: { type: 'file', filename: 'web-crawler.log' } },
    categories: { default: { appenders: ['web_crawler'], level: 'debug' } }
});

//init log
let logger = log4js.getLogger("web_crawler");