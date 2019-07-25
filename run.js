const fs = require("fs")



import MyBot from "./app/crawler/MyBot"

// log4js.configure({
//     appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//     categories: { default: { appenders: ['cheese'], level: 'error' } }
// });

//init log

let tuoi_tre_config = {
    _id: '5ce8ca109bbaf40ed7b5bff0',
    name: 'vnexpress_net',
    origin_url: 'https://vnexpress.net',
    should_visit_prefix: ['https://vnexpress.net'],
    page_data_prefix: ['https://vnexpress.net'],
    visit_regex: ['(https:\\/\\/vnexpress.net\\/kinh-doanh)','(https:\\/\\/vnexpress.net\\/thoi-su)'],
    page_data_regex: ['(https:\\/\\/vnexpress.net)([A-Za-z0-9\\/-]{0,1000})(.html$)'],
    ignore_regex: ['(https:\\/\\/vnexpress.net\\/the-gioi)'],
    max_depth: 0,
    time_delay: 10,
    content_selector: [
        { name: 'title', selector: 'h1.title_news_detail' },
        {
            name: 'content',
            selector: '.container article.content_detail, .container .sidebar_1 .description'
        },
        {
            name: 'category',
            selector: 'body > section.cat_header.clearfix > ul > li > h4 > a'
        },
        {
            name: 'strPostedAt',
            selector: 'body > section.container > ' +
                'section.wrap_sidebar_12 > section.sidebar_1 ' +
                '> header > span'
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
