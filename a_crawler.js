import Crawler from "./crawler";
const Request = require('axios')
const Cheerio = require('cheerio')

export default class ACrawler extends Crawler{
    async _get_data(url){  
        try {
            let html_content = await Request(url)  
            const $ = Cheerio.load(html_content.data)
            let title = $('h1.firstHeading').text()
            console.log(title)
            this.fs.appendFile(this.config.name + ".txt", title + "\n", () => { }); 
        } catch (e) {
            this.LOGGER.error("Get Data +" + url)
        }
    }
}