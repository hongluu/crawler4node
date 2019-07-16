const Cheerio = require('cheerio')
import Bot from "./Bot"
export default class MyBot extends Bot{
    
    async _store_err_url(url){
        this.fs.appendFileSync("01_error.txt", url + "\n", () => { })
    }

    async _process_data1(url, html) {
        // let res = this.redisClient.hgetall("bull:Forum_Bot:" + this.config.bot_id, (err, res) => {
        // if(!res) this.isFinished = true;

        if (html && url) {
            const $ = Cheerio.load(html)
            let content_selectors = this.config.content_selector;

            let elements = {};
            let selectorSize = content_selectors.length;
            for (let i = 0; i < selectorSize; i++) {
                let content_selector = content_selectors[i];
                let attr = content_selector.name;
                elements[attr] = $(content_selector.selector) ? $(content_selector.selector) : [];
            }
            let title = $(elements.title).text();
            let itemSize = elements.url ? elements.url.length : 0;
            if (itemSize > 0) {
                for (let itemtIndex = 0; itemtIndex < itemSize; itemtIndex++) {
                    let post = {};
                    try {
                        post.url = this._get_full_url($(elements.url[itemtIndex]).attr('href')) + '#' + $(elements.url[itemtIndex]).text().replace('#', '');
                        post.title = title;
                        post.content = $(elements.content[itemtIndex]).text() ? $(elements.content[itemtIndex]).text().trim() : '';
                        post.strPostedAt = $(elements.strPostedAt[itemtIndex]).text();
                        post.frUsername = $(elements.frUsername[itemtIndex]).text();
                        post.frUserType = $(elements.frUserType[itemtIndex]).text();
                        if (this.isTesting) {
                            this.dataTest.push(post)
                        } else {
                            await this._store_data(post.url, post);
                        }

                    } catch (e) {
                        console.error(url);
                        console.log(JSON.stringify(post));
                    }
                }
            }
        }

    }
}