/**
 * @description Default Crawler
 * @author HongLM
 * @copyright kiwiluvtea
 */
import Filter from "./Filter"
const axios = require('axios')
const Cheerio = require('cheerio')
import Bottleneck from "bottleneck";
const url_resolver = require('url');
const log4js = require('log4js');

const CONFIG_DEFAULT = {
    name: 'crawl-storage-1',
    origin_url: '',
    time_delay: 0,
    should_visit_pattern: '',
    is_resuming: true,
    max_connections: 3,
    should_visit_prefix: [],
    page_data_prefix: [],
    ignore_url: [],
    allway_visit: [],
    page_data_pattern: '',
    max_depth: -1,
    filter_storage: './storage/',
    max_url :900000000
    
};
log4js.configure({
    appenders: { cheese: { type: 'console', filename: 'bot.log' } },
    categories: { default: { appenders: ['cheese'], level: 'error' } }
});


export default class Bot {
    constructor(config) {
        this.config = this._init_config(config) 
        console.log(config)
        this.data = {};
        this.vm = this;
        this.fs = require("fs");
        this.LOGGER = log4js.getLogger("web_crawler_1");;
        this.LOGGER.level = "debug";
        this.promise_list = []
        this.json_filter_path = this.config.filter_storage + this.config.name + ".json";
        this.url_filter = new Filter({
            storage_path: this.json_filter_path,
            isUpdate: false
        });
        this.limiter = new Bottleneck({
            minTime: this.config.time_delay
        });
        this.request = axios.create({ timeout: 30000});
        this.dataTest=[];
        this.isTesting = false;
    }

    _init_config(config) {
        let _config = Object.assign(CONFIG_DEFAULT, config);
        if (_config.should_visit_prefix.length == 0) 
            _config.should_visit_prefix[0] = config.origin_url;
        if (_config.page_data_prefix.length == 0) 
            _config.page_data_prefix[0] = config.origin_url;
        if (_config.allway_visit.length == 0)
            _config.allway_visit[0] = config.origin_url;

        return _config;
    }

    async restart() {
        try{
            this.fs.unlinkSync(this.json_filter_path, () => { })
        }catch(e){
        }
        
        this.url_filter = new Filter({
            storage_path: this.json_filter_path,
            isUpdate: false
        });
        return await this.start();
        
    }

    async update() {
        this.LOGGER.debug("UPDATE " + this.config.name)
        let update_filter = new Filter({ isUpdate: true });
        await this.crawl(update_filter);
        this.LOGGER.debug("FINISH " + this.config.name)
        this.storeUrlFilterToFile(update_filter);  
    }

    async start() {
        this.LOGGER.debug("START " + this.config.name)
        await this.crawl(this.url_filter);
        this.LOGGER.debug("FINISH " + this.config.name)
        this.storeUrlFilterToFile(this.url_filter);
    }
    // Test các url trên link xuất phát
    async test() {
        this.LOGGER.debug("START " + this.config.name)
        this.isTesting = true;
        this.config.max_depth = 2;
        this.url_filter = new Filter({isUpdate: true});
        await this.crawl(this.url_filter);
        this.LOGGER.debug("FINISH " + this.config.name)
        // this.storeUrlFilterToFile(this.url_filter);
        return this.dataTest;
    }
    
    async crawl(url_filter) { 
        let max_depth = this.config.max_depth;
        this.config.allway_visit.forEach(url => url_filter.remove(url));
        if (max_depth > 0) {
            await this.visit(url_filter, this.config.origin_url, max_depth);
        }
        else {
            await this.visit(url_filter, this.config.origin_url);
        }
    }
    async storeUrlFilterToFile(url_filter){
        let exported = url_filter.saveAsJSON()
        this.fs.writeFile(this.json_filter_path, JSON.stringify(exported), () => { });
    }

    async visit(filter,url, max_depth) {
        if (filter.has(url)) {
            return
        }
        if (max_depth == 1) {
            filter.add(url);
            let html_content = await this._get_html_by(url)
            if (html_content){
                let responseUrl = html_content.responseUrl;
                if (responseUrl && responseUrl!== url){
                    filter.add(url);
                }
                if (this._is_page_data(responseUrl)) {
                    this._process_data(url, html_content.html);
                }
            }
                
            return;
        }
        filter.add(url);
        let page = await this._flip_urls(url);
        if (this._is_page_data(url)) {
            this._process_data(url, page.html);
        }
        let urls = page.urls;
        if (urls) {
            await Promise.all(urls.map(cur_url => {
                if (filter.has(cur_url)) {
                    return
                }
                if (this._is_should_visit(cur_url)) {
                    return this.limiter.schedule(() => this.visit(filter,cur_url, max_depth - 1));
                }
            })).catch(e => { this.LOGGER.error(e) });
        }
    }

    async _flip_urls(url) {
        let html_content = await this._get_html_by(url);
        if(!html_content){
            return [];
        }
        const $ = Cheerio.load(html_content.html)
        let list = [];
        let url_els = $('a');
        for (let i = 0; i < url_els.length; i++) {
            let url_a = $(url_els[i]).prop('href');
            if (url_a) {
                url_a = this._get_full_url(url_a);
                if (this._is_should_visit(url_a)) {
                    list.push(url_a);
                }
            }
        }
        return { urls: list, html: html_content.html };
    }
    _get_full_url(url) {
        if (url && url.length > 0 ){
            let new_url = url_resolver.resolve(this.config.origin_url, url);
            //clean Url - remove after #
            new_url = this._clean_anchor_url(new_url);
            // let size_of_new_url = new_url.length;
            // if (new_url[size_of_new_url-1] == "/"){
            //     return new_url.slice(0, size_of_new_url - 1);
            // }
            return new_url;
        }      
    }
    async _get_html_by(url){
        let res = null;
        let responseUrl = null;
        try {
            res = await this.request.get(url)
            if (res.statusText !== 'OK') {
                this._store_err_url(url);
                return null;
            }
            responseUrl = this._clean_anchor_url(res.request.res.responseUrl);
        } catch (e) {
            this._store_err_url(url);
            console.log(e);
            return null;
        }
        return { responseUrl: responseUrl,html:res.data};    
    }
    async _get_data() {

    }   
    _store_err_url() {

    }
    _clean_anchor_url(url){
        if(url)
            return url.replace(/#([a-z]|[^a-z#]){1,20}$/, "");
    }
    _is_existed(url) {
        return this.url_filter.has(url);
    }

    _is_page_data(url_a) {
        // check prefix
        if (this._is_list_contain(this.config.page_data_prefix, url_a)) {
            return true;
        };
        // check regex pattern
        let matches_array = url_a.match(this.config.page_data_pattern);
        return (matches_array != undefined && matches_array.length > 0)
    }

    _is_should_visit(url_a) {
        // check prefix
        if (this._is_list_contain(this.config.should_visit_prefix, url_a)) {
            return true;
        };
        return false;
    }

    _is_list_contain(list, x) {
        for (let i = 0; i < list.length; i++) {
            if (x.includes(list[i])) {
                return true;
            }
        }
        return false;
    }

    _process_data(url, html) {
        if (html && url) {
            const $ = Cheerio.load(html)
            let content_selectors = this.config.content_selector;
            let data = {};
            for (let i = 0; i < content_selectors.length; i++) {
                let content_selector = content_selectors[i];
                let attr = content_selector.name;

                if (attr == 'url') {
                    let url = $(content_selector.selector).attr('href');
                    data[content_selector.name] = this._get_full_url(url)
                } else {
                    attr = content_selector.name;
                    let text = $(content_selector.selector).text();
                    if (text) {
                        data[attr] = text.trim();
                        if (attr == 'title') {
                        }
                    }
                }
            }
            if (data.content){
                if (this.isTesting) {
                    this.dataTest.push(data)
                }else{
                    this._store_data(url, data);
                }
            }
            
            
        }
        
    }
    _store_data(url,data) {
        this.fs.appendFileSync("01_url.txt", url + "\n", () => { })
    }

}
