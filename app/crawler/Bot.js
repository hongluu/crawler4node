/**
 * @description Default Crawler
 * @author HongLM
 * @copyright kiwiluvtea
 */
import Filter from "./Filter"
const axios = require('axios')
const Cheerio = require('cheerio')
import Bottleneck from "bottleneck";


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
};

export default class Bot {
    constructor(config, logger) {
        this.config = this._init_config(config) 
        this.data = {};
        this.vm = this;
        this.fs = require("fs");
        this.LOGGER = logger;
        this.promise_list = []
        this.json_filter_path = this.config.filter_storage + this.config.name + ".json";
        this.url_filter = new Filter({
            storage_path: this.json_filter_path,
            isUpdate: false
        });
        this.limiter = new Bottleneck({
            minTime: this.config.time_delay
        });
        this.request = axios.create({ timeout: 5000});
    }

    _init_config(config) {
        let _config = Object.assign(CONFIG_DEFAULT, config);
        if (_config.should_visit_prefix.length == 0) 
            _config.should_visit_prefix[0] = config.origin_url+"/";
        if (_config.page_data_prefix.length == 0) 
            _config.page_data_prefix[0] = config.origin_url + "/";
        if (_config.allway_visit.length == 0)
            _config.allway_visit[0] = config.origin_url;

        return _config;
    }

    async restart() {
        this.fs.writeFile(this.config.name + ".txt", "", () => { });
        this.start()
    }

    async update() {
        this.LOGGER.debug("UPDATE " + this.config.name)
        let max_depth = this.config.max_depth;
        this.config.allway_visit.forEach(url => this.url_filter.remove(url));
        let update_filter = new Filter({isUpdate: true});
        if (max_depth > 0) {
            await this.visit_update(update_filter,this.config.origin_url, max_depth);
        } else {
            await this.visit_update(update_filter.config.origin_url);
        }
        let exported = this.url_filter.saveAsJSON()
        this.fs.writeFile(this.json_filter_path, JSON.stringify(exported), () => { });
        this.LOGGER.debug("FINISH " + this.config.name)
    }

    async start() {
        this.LOGGER.debug("START " + this.config.name)
        let max_depth = this.config.max_depth;
        this.config.allway_visit.forEach(url => this.url_filter.remove(url));
        if (max_depth > 0) {
            await this.visit(this.config.origin_url, max_depth);
        } else {
            await this.visit(this.config.origin_url);
        }
        let exported = this.url_filter.saveAsJSON()
        this.fs.writeFile(this.json_filter_path, JSON.stringify(exported), () => { });
        this.LOGGER.debug("FINISH " + this.config.name)
    }
    async visit_update(update_filter,url, max_depth) {
        if (update_filter.has(url)) {
            return
        }
        if (max_depth == 1) {
            update_filter.add(url);
            try {
                let html_content = await this._get_html_by(url)
                // this.LOGGER.error(html_content)
                if (html_content)
                    if (this._is_page_data(url)) {
                        if(!this._is_existed(url)){
                            console.log(url)
                            this.url_filter.add(url);
                            this._process_data(url, html_content);
                        }
                    }
            } catch (e) {
                // console.log(e)
                this._store_err_url(url);
            }

            return;
        }
        update_filter.add(url);
        let page = await this._flip_urls(url);
        if (this._is_page_data(url)) {
            if(!this._is_existed(url)){
                this.url_filter.add(url);
                this._process_data(url, page.html);
            }              
        }
        let urls = page.urls;
        if (urls) {
            await Promise.all(urls.map(cur_url => {
                if (update_filter.has(cur_url)) {
                    return
                }
                if (this._is_should_visit(cur_url)) {
                    return  this.visit_update(update_filter,cur_url, max_depth - 1);
                }
            })).catch(e => { this.LOGGER.error(e) });
        }
    }

    async visit(url, max_depth) {
        if (this._is_existed(url)){
            return
        }
        if (max_depth == 1) {
            this.url_filter.add(url);
            try {
                let html_content = await this._get_html_by( url)
                if (html_content)
                if (this._is_page_data(url)) {
                    this._process_data(url, html_content);
                }
            } catch (e) {
                this._store_err_url(url);
            }
            
            return;
        }
        
        this.url_filter.add(url);
        let page = await this._flip_urls(url);
        if (this._is_page_data(url)) {
            this._process_data(url, page.html);
        }
        let urls = page.urls;
        if (urls) {
            await Promise.all(urls.map(cur_url => {
                if (this._is_existed(cur_url)) {
                    return
                }
                if (this._is_should_visit(cur_url)) {
                    return this.limiter.schedule(()=> this.visit(cur_url, max_depth - 1));
                }
            })).catch(e => { this.LOGGER.error(e) });
        }     
    }

    async _flip_urls(url) {
        let html_content = await this._get_html_by(url);
        if(!html_content){
            return [];
        }
        const $ = Cheerio.load(html_content)
        let list = [];
        let url_els = $('a');
        for (let i = 0; i < url_els.length; i++) {
            let url_a = $(url_els[i]).prop('href');
            if (url_a) {
                if (url_a.startsWith("/")) {
                    url_a = this._get_full_url(url_a);
                }
                if (this._is_should_visit(url_a)) {
                    list.push(url_a);
                }
            }
        }
        return { urls: list, html: html_content };
    }
    _get_full_url(url) {
        return this.config.origin_url + url;    
    }
    async _get_html_by(url){
        let html_content = null;
        try {
            html_content = await this.request.get(url)
            if (html_content.statusText !== 'OK') {
                this._store_err_url(url);
                return null;
            }
        } catch (e) {
            // console.log(e)
            this._store_err_url(url);
            return null;
        }
        return html_content.data;    
    }
    async _get_data() {

    }
    _store_err_url() {

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

}
