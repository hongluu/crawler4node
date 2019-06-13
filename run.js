const fs = require("fs")

import MyBot from "./app/crawler/MyBot"

// log4js.configure({
//     appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//     categories: { default: { appenders: ['cheese'], level: 'error' } }
// });

//init log

let tuoi_tre_config = {
    name: 'tuoitre_vn',
    origin_url: 'https://tuoitre.vn',
    should_visit_prefix: ['https://tuoitre.vn'],
    page_data_prefix: ['https://tuoitre.vn'],
    should_visit_pattern: '',
    page_data_pattern: '',
    max_depth: 0,
    time_delay: 10,
    content_selector: [
        { name: 'title', selector: '#main-detail > div.w980 > h1' },
        {
            name: 'content',
            selector: '#mainContentDetail h2,#main-detail-body p'
        }
    ],
    proxyl: { host: '', port: '0', auth: { username: '', password: '' } },
    isUpdate: true,
    bot_id: '5ce8ca109bbaf40ed7b5bff0',
    redis: { port: 6379, host: '127.0.0.1' }
}


let ttv = {
    name: 'ttvnol_com',
    origin_url: 'http://ttvnol.com',
    should_visit_prefix: ['http://ttvnol.com'],
    page_data_prefix: ['http://ttvnol.com'],
    should_visit_pattern: '',
    page_data_pattern: '',
    max_depth: 0,
    time_delay: 100,
    content_selector: [
        { name: 'title', selector: 'div > div.titleBar > h1' },
        {
            name: 'content',
            selector: 'li > div.messageInfo.primaryContent > div.messageContent > article'
        },
        {
            name: 'frUsername',
            selector: 'li > div.messageUserInfo > div > div > h3 > a'
        },
        {
            name: 'frUserType',
            selector: 'li > div.messageUserInfo > div > div > h3 > em'
        },
        {
            name: 'url',
            selector: 'li > div.messageMeta_new > div:nth-child(2) > a'
        },
        {
            name: 'strPostedAt',
            selector: 'li > div.messageMeta_new > div.privateControls > span > a'
        }
    ],
    proxyl: { host: '', port: '0', auth: { username: '', password: '' } },
    isUpdate: true,
    bot_id: '5ce82a1493af3b1d09cc38fd',
    redis: { port: 6379, host: '127.0.0.1' }
};

let a = {
    name: 'hanoimoi_com.vn',
    origin_url: 'http://hanoimoi.com.vn',
    should_visit_prefix: ['http://hanoimoi.com.vn'],
    page_data_prefix: ['http://hanoimoi.com.vn'],
    should_visit_pattern: '',
    page_data_pattern: '',
    max_depth: 3,
    time_delay: 10,
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
