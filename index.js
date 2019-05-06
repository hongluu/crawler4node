import ACrawler from "./a_crawler"
const { BloomFilter} = require('bloom-filters')
const log4js = require('log4js');

//init log
let logger = log4js.getLogger();
logger.level = 'debug';
//init cookoo filter
let filter = new BloomFilter(300000,0.000001);
let config = {
    name: 'crawl-storage-1',
    origin_url: 'http://tuoitre.vn',
    time_delay: 0,
    should_visit_prefix: ['http://tuoitre.vn'],
    page_data_prefix: ['http://tuoitre.vn'],
    is_resuming: true,
    max_connections: 1,
    max_depth:3
};
let crawler = new ACrawler(config, filter, logger);
crawler.restart();