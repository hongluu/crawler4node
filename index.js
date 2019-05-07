import ACrawler from "./a_crawler"

const fs = require("fs")
// const BloomFilter = require('bloomfilter-redis');
const redis = require("redis");

const log4js = require('log4js');
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'web-crawler.log' } },
    categories: { default: { appenders: ['cheese'], level: 'debug' } }
});

//init log
let logger = log4js.getLogger("cheese");
class MyBloom{
    constructor(bloomf){
        this.bloomf = bloomf;
    }
    add(url){
        return this.bloomf.insert(url)
    }
    has(url){
        return this.bloomf.test(url)
    }
}
class BloomRedis{
    constructor(bloomf){
        this.bloomf = bloomf;
    }
    add(url){
        this.bloomf.add(url)
    }
    has(url){
        return this.bloomf.contains(url)
    }
}
//init cookoo filter
// let filter = new MyBloom(new BloomFilter(300,10));

// let bf = new BloomFilter({//all params have a default value, and I choose some to present below
//     redisSize: 16, // this will create a string value which is 16 MegaBytes in length
//     hashesNum: 8, // how many hash functions do we use
//     redisKey: 'test', //this will create a string which keyname is `test`
//     redisClient: redis.createClient(), //you can choose to create the client by yourself
// });
// bf.init();
// let filter = new BloomRedis(bf);
let config = {
    name: 'crawl-storage-1',
    origin_url: 'http://tuoitre.vn',
    time_delay: 0,
    should_visit_prefix: ['http://tuoitre.vn'],
    page_data_prefix: ['http://tuoitre.vn'],
    ignore_url: [],
    allway_visit: ["http://tuoitre.vn", 
        "http://tuoitre.vn/caf-co-chu-tich-moi-sau-gan-30-nam-1281830.htm",
        "http://tuoitre.vn/thoi-su.htm",
        "http://tuoitre.vn/the-gioi.htm"],
    is_resuming: true,
    max_connections: 1,
    max_depth:3
};



let crawler = new ACrawler(config, logger);
crawler.restart();