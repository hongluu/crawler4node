const Cheerio = require('cheerio')

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
}