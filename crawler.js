import { resolve } from 'uri-js';

/**
 * @description Default Crawler
 * @author HongLM
 * @copyright kiwiluvtea
 */

const ARequest = require('axios')
const Cheerio = require('cheerio')
const CONFIG_DEFAULT = {
    name:'crawl-storage-1',
    origin_url: '',
    time_delay: '',
    should_visit_pattern: '',
    is_resuming : true,
    max_connections :1,
    should_visit_prefix: [this.origin_url],
    page_data_prefix: [this.origin_url],
    page_data_pattern :'',
    max_depth:-1,

};

export default class Crawler { 
    constructor(config, url_filter,  logger) {
        this.config = Object.assign(CONFIG_DEFAULT, config);
        this.url_filter = url_filter;
        this.data = {} ;
        this.vm = this;
        this.fs = require("fs");
        this.LOGGER = logger;
        this.promise_list = []

    }
    
    async restart(){
        this.fs.writeFile(this.config.name + ".txt", "", () => { }); 
        this.start()

    }
    async start(){
        this.LOGGER.debug("START " + this.config.name)
        let max_depth = this.config.max_depth;
        if (max_depth > 1){
            await this.visit(this.config.origin_url, max_depth) ;    
        }else{
            await this.visit(this.config.origin_url);
            this.LOGGER.debug("FINISH " + this.config.name)
        }       
    }
    
    async visit (url) {
        if (!this._is_existed(url)) {
            this.url_filter.add(url);
            let urls = await this._flip_urls(url);
            for (let i = 0; i < urls.length; i++) {
                let cur_url = urls[i];
                if (this._is_existed(cur_url)) {
                    continue
                }
                if (this._is_page_data(cur_url)) {
                    this._get_data(cur_url);
                }
            }
        }
        
    }
    
    async visit (url, max_depth) {
        if (max_depth == 1){
            return;
        }
        if (!this._is_existed(url)) {
            this.url_filter.add(url);
            let urls = await this._flip_urls(url);
            for (let i = 0; i < urls.length; i++) {
                let cur_url = urls[i];
                if (this._is_existed(cur_url)) {
                    continue
                }
                //let exported = this.url_filter.saveAsJSON()
                // this.fs.writeFile(this.config.name + ".json", JSON.stringify(exported), () => { });
                if (this._is_should_visit(cur_url)) {
                    if (this._is_page_data(cur_url)) {
                        this._get_data(cur_url);
                    }
                    this.visit(cur_url, max_depth - 1);
                }

            }
        }
    }

    async _flip_urls (url){
        let html_content = '';
        try{
            html_content = await ARequest(url)
        }catch(e){
            return [];
        } 
        const $ = Cheerio.load(html_content.data)
        let list = [];
        // console.log(html_content.request.connection.protocol)
        //let base_url = "https://" + html_content.request.connection.servername;
        let base_url = this.config.origin_url
        let url_els = $('a');
        for (let i = 0; i < url_els.length; i++){
            let url_a = $(url_els[i]).prop('href');
            //console.log(url_a);
            if (url_a){
                if (this._is_existed(url_a)) {
                    continue
                }
                if (url_a.startsWith("/")) {
                    url_a = base_url + url_a;
                }
                if (this._is_should_visit(url_a)) {
                    list.push(url_a);
                }
            }        
        }
        return list;
    }
    _get_data(url) {
        console.log(url)
    }
    _is_existed (url){
        return this.url_filter.test(url);
    }
    _is_page_data(url_a) {
        // check prefix
        if(this._is_list_contain(this.config.page_data_prefix,url_a)){
            return true;
        };
        // check regex pattern
        let matches_array = url_a.match(this.config.page_data_pattern);
        return (matches_array !=undefined && matches_array.length >0)
    }
    
    _is_should_visit(url_a){
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

    _get_all_url  (url){
        //TODO
    }
}


