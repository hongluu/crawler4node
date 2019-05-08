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
    origin_url: 'https://thanhnien.vn/',
    should_visit_prefix: ['https://thanhnien.vn/'],
    page_data_prefix: ['https://thanhnien.vn/'],
    max_depth:3,
    allway_visit: ["https://thanhnien.vn/thoi-su/chinh-tri/"],
    data_selector: {
        title: "#st-container > div > div.site-content > div:nth-child(1) > div.l-content > div.highlight > article > h2"
    }
};

let tuoi_tre_config = {
    name: 'crawl-storage-1',
    origin_url: 'https://tuoitre.vn',
    should_visit_prefix: ['https://tuoitre.vn/'],
    page_data_prefix: ['https://tuoitre.vn/'],
    max_depth:3,
    data_selector:{
        title: "#main-detail > div.w980 > h1"
    }
};

let crawler = new ACrawler(tuoi_tre_config, logger);
crawler.start();

// var Bull = require('bull');
// const web_crawler_queue = new Bull('web_crawler');

// web_crawler_queue.process(async (job, data) => {
//     console.log(1)
//     job.progress(progress);
// })
// web_crawler_queue.pause().then(function () {
//     // queue is paused now
//     console.log("hello")
// });