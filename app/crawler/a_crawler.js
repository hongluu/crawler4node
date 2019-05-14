const Cheerio = require('cheerio')
import Bot from "./Bot"

export default class ABot extends Bot{
    _process_data(url,html){
        if (html && url){
            const $ = Cheerio.load(html)
            this.fs.appendFileSync("01_url.txt", url +"\n" , () => { })
            let title = $(this.config.data_selector.title).text();
            if (title)
                this.fs.appendFileSync("01_test.txt", url + "\n" + title+ "\n",()=>{})
        }
    }
    _store_err_url(url){
        this.fs.appendFileSync("01_error.txt", url + "\n", () => { })
    }
}