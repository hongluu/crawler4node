/**
 * @description Default Crawler
 * @author HongLM
 * @copyright kiwiluvtea
 */
const { CuckooFilter } = require('bloom-filters')
const ARequest = require('axios')
const Cheerio = require('cheerio')
var NodeCrawler = require("crawler");
import Bottleneck from "bottleneck";


const CONFIG_DEFAULT = {
    name: 'crawl-storage-1',
    origin_url: '',
    time_delay: 0,
    should_visit_pattern: '',
    is_resuming: true,
    max_connections: 3,
    should_visit_prefix: [this.origin_url],
    page_data_prefix: [this.origin_url],
    ignore_url: [],
    allway_visit: [],
    page_data_pattern: '',
    max_depth: -1,
    filter_storage: './storage/',
};

export default class Crawler {
    constructor(config, logger) {
        this.config = _init_config(config) 
        this.data = {};
        this.vm = this;
        this.fs = require("fs");
        this.LOGGER = logger;
        this.promise_list = []
        this.json_filter_path = this.config.filter_storage + this.config.name + ".json";
        this.url_filter = this._init_filter(this.json_filter_path);
        this.limiter = new Bottleneck({
            minTime: this.config.time_delay
        });
    }

    _init_config(config) {
        let _config = Object.assign(CONFIG_DEFAULT, config);
        if (!_config.should_visit_prefix) _config.should_visit_prefix = config.origin_url;
        if (!_config.page_data_prefix) _config.page_data_prefix = config.origin_url;
        if (!_config.allway_visit) _config.allway_visit = config.origin_url;
    }

    _init_filter(json_filter_path) {
        try {
            this.LOGGER.debug("UPDATE " + this.config.name + "...")
            let boomfile = this.fs.readFileSync(json_filter_path)
            let exported = JSON.parse(boomfile);
            return CuckooFilter.fromJSON(exported);
        } catch (e) {
            this.LOGGER.debug("FIRST " + this.config.name + "...")
            return new CuckooFilter(30000, 400, 8);
        }
    }

    async restart() {
        this.fs.writeFile(this.config.name + ".txt", "", () => { });
        this.start()
    }

    async start() {
        this.LOGGER.debug("START " + this.config.name)
        let max_depth = this.config.max_depth;
        this.config.allway_visit.forEach(url => this.url_filter.remove(url));
        if (max_depth > 1) {
            await this.visit(this.config.origin_url, max_depth);
        } else {
            await this.visit(this.config.origin_url);
        }
        let exported = this.url_filter.saveAsJSON()
        this.fs.writeFile(this.json_filter_path, JSON.stringify(exported), () => { });
        this.LOGGER.debug("FINISH " + this.config.name)
    }

    async visit(url, max_depth) {
        console.log(url)
        if (max_depth == 1) {
            this.url_filter.add(url);
            return;
        }
        if (!this._is_existed(url)) {
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
    }

    async _flip_urls(url) {
        let html_content = '';
        try {
            html_content = await ARequest({ url, timeout: 10000 })
        } catch (e) {
            console.log(e)
            this._store_err_url(url);
            return [];
        }

        const $ = Cheerio.load(html_content.data)
        let list = [];
        let base_url = this.config.origin_url
        let url_els = $('a');
        for (let i = 0; i < url_els.length; i++) {
            let url_a = $(url_els[i]).prop('href');
            if (url_a) {
                if (this._is_existed(url_a)) {
                    continue
                }
                if (url_a.startsWith("/")) {
                    url_a = base_url + url_a;
                    //console.log(url_a)
                }
                if (this._is_should_visit(url_a)) {
                    list.push(url_a);
                }
            }
        }
        return { urls: list, html: html_content.data };
    }

    async _visit_page_data(url) {
        let seft = this;
        try {
            seft.fs.appendFile("crawl-storage-1.txt", url + "\n", () => { })
            this.worker.queue({
                uri: url,
                data_selector: seft.config.data_selector,
                callback: seft._get_data
            })
        } catch (e) {
            console.log(e)
            this.LOGGER.error("Get Data +" + url)
        }
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
