import ACrawler from "./a_crawler"

const fs = require("fs")
const log4js = require('log4js');

log4js.configure({
    appenders: { web_crawler: { type: 'file', filename: 'web-crawler.log' } },
    categories: { default: { appenders: ['web_crawler'], level: 'debug' } }
});

//init log
let logger = log4js.getLogger("web_crawler");
//init config
let config = {
    name: 'crawl-storage-1',
    origin_url: 'https://en.wikipedia.org',
    should_visit_prefix: ['https://en.wikipedia.org/'],
    page_data_prefix: ['https://en.wikipedia.org/wiki/'],
    max_depth:3
};

let crawler = new ACrawler(config, logger);
crawler.start();