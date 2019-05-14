const fs = require("fs")
const log4js = require('log4js');

import ABot from "./app/crawler/a_crawler"

// log4js.configure({
//     appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//     categories: { default: { appenders: ['cheese'], level: 'error' } }
// });

//init log
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'bot.log' } },
    categories: { default: { appenders: ['cheese'], level: 'error' } }
});
let logger = log4js.getLogger("web_crawler_1");
logger.level = 'debug';

let tuoi_tre_config = {
    name: 'crawl-storage-1',
    origin_url: 'https://tuoitre.vn',
    should_visit_prefix: ['https://tuoitre.vn/'],
    page_data_prefix: ['https://tuoitre.vn/'],
    max_depth: 2,
    time_delay: 10,
    data_selector: {
        title: "#main-detail > div.w980 > h1"
    }
};

let bot = new ABot(tuoi_tre_config, logger);
bot.start();