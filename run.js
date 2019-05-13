const fs = require("fs")
const log4js = require('log4js');

import Acrawler from "./a_crawler"

log4js.configure({
    appenders: { web_crawler: { type: 'file', filename: 'web-crawler.log' } },
    categories: { default: { appenders: ['web_crawler'], level: 'debug' } }
});

//init log
let logger = log4js.getLogger("web_crawler");

let tuoi_tre_config = {
    name: 'crawl-storage-1',
    origin_url: 'https://tuoitre.vn',
    should_visit_prefix: ['https://tuoitre.vn/'],
    page_data_prefix: ['https://tuoitre.vn/'],
    max_depth: 4,
    time_delay: 1000,
    data_selector: {
        title: "#main-detail > div.w980 > h1"
    }
};

let crawler = new Acrawler(tuoi_tre_config, logger);
crawler.start();