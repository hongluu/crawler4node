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
    max_depth: 2,
    time_delay: 10,
    max_url:10,
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
    name: 'tuoitre_vn',
    origin_url: 'https://tuoitre.vn',
    should_visit_prefix: [],
    page_data_prefix: [],
    should_visit_pattern: '',
    page_data_pattern: '',
    max_depth: '0',
    time_delay: 10,
    content_selector: [
        { name: 'title', selector: '#main-detail > div.w980 > h1' }, {
            name: 'content',
            selector: ".content>p,.main-content-body>h2"
        }
    ],
    proxyl: { host: '', port: '0', auth: { username: '', password: '' } },
    
    
}

let bot = new MyBot(a);
bot.test().then((data)=>{
    console.log(data);
});


bot= null;
// setInterval(()=> { 
//     console.log("start");
//     let bot = new MyBot(tuoi_tre_config, logger);
//     bot.update()
// },30*1000);
