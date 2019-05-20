const Cheerio = require('cheerio')
import Bot from "./Bot"

export default class MyBot extends Bot{
    _process_data(url,html){
        if (html && url){
            const $ = Cheerio.load(html)
            let content_selectors = this.config.content_selector;
            for (let i = 0; i < content_selectors.length; i++) {
                let content_selector = content_selectors[i];
                let data = {};

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
                        this.dataTest.push(data)
                    }

                }
            }
        }
    }
    async _store_err_url(url){
        this.fs.appendFileSync("01_error.txt", url + "\n", () => { })
    }
}