const Cheerio = require('cheerio')
import Crawler from "./crawler"

export default class ACrawler extends Crawler{
    _process_data(url,html){
        if (html && url){
            const $ = Cheerio.load(html)
            this.fs.appendFileSync("url.txt", url +"\n" , () => { })
            let title = $(this.config.data_selector.title).text();
            if (title)
                this.fs.appendFileSync("test.txt", url + "\n" + title+ "\n",()=>{})
        }
    }
    _store_err_url(url){
        this.fs.appendFileSync("error.txt", url + "\n", () => { })
    }
}