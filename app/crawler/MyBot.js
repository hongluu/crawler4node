const Cheerio = require('cheerio')
import Bot from "./Bot"

export default class MyBot extends Bot{
    
    async _store_err_url(url){
        this.fs.appendFileSync("01_error.txt", url + "\n", () => { })
    }
}