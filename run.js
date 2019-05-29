const fs = require("fs")

import MyBot from "./app/crawler/MyBot"

// log4js.configure({
//     appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//     categories: { default: { appenders: ['cheese'], level: 'error' } }
// });

//init log


let tuoi_tre_config = {
    name: 'crawl-storage-1',
    origin_url: 'https://tuoitre.vn',
    should_visit_prefix: ['https://tuoitre.vn'],
    page_data_prefix: ['https://tuoitre.vn'],
    max_depth: 10,
    time_delay: 333,
    max_url:3,
    content_selector: [
        {   name: 'title',
            selector: "#main-detail > div.w980 > h1"
        },{
            name: 'content',
            selector: ".content>p,.main-content-body>h2"
        }
    ]
};

let a = {
    name: 'hanoimoi_com.vn',
    origin_url: 'http://hanoimoi.com.vn',
    should_visit_prefix: ['http://hanoimoi.com.vn'],
    page_data_prefix: ['http://hanoimoi.com.vn'],
    should_visit_pattern: '',
    page_data_pattern: '',
    max_depth: 3,
    time_delay: 100,
    content_selector: [
        { name: 'title', selector: '#NewsDetails > h1' },
        {
            name: 'content',
            selector: '#NewsDetails > div.content > div.gallery-included ' +
                '> div.article > div:nth-child(1) > strong,#abody'
        }
    ],
    proxyl: { host: '', port: '0', auth: { username: '', password: '' } }
}

let bot = new MyBot(tuoi_tre_config);
// bot.update().then((data)=>{
//     console.log(data);
// });
bot.run();

bot= null;
// setInterval(()=> { 
//     console.log("start");
//     let bot = new MyBot(tuoi_tre_config, logger);
//     bot.update()
// },30*1000);
