const Cheerio = require('cheerio')
import Bot from "./Bot"

export default class MyBot extends Bot{
    _process_data(url: string | String,html: String | null){
        if (html && url){
            const $ = Cheerio.load(html)
            this.fs.appendFileSync("01_url.txt", url +"\n" , () => { })
            let title = $(this.config.data_selector.title).text()
            if (title)
                this.fs.appendFileSync("01_test.txt", url + "\n" + title+ "\n",()=>{})
        }
    }
    async _store_err_url(url: string | String){
        this.fs.appendFileSync("01_error.txt", url + "\n", () => { })
    }
}