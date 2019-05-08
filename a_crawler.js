import Crawler from "./crawler";
const Request = require('axios')
const Cheerio = require('cheerio')

export default class ACrawler extends Crawler{
    
    async _get_data(error, res, done) {
        if (error) {
            console.log(error);
        } else {
            try{
                console.log(res.options.uri)
                if (res.statusCode != 200){
                    console.log("Error, http code: ", res.statusCode);
                    done();
                    return
                }
                console.log(1)
                let $ = res.$;
                if ($){
                    let data_selector = res.options.data_selector;
                    if (!data_selector.title){
                        done();
                        return;
                    }
                    let title = $(data_selector.title).text();
                    if (title && title.trim()){
                        Object.keys(data_selector).forEach(key => {
                            // if (key == "title") {
                            //     if (!$(data_selector[key]).text()) {
                            //         continue;
                            //     }
                            // }
                            let data = {};
                            data[key] = $(data_selector[key]).text();
                            console.log(data)

                        })
                    }
                    
                    done();
                }
            }catch(e){
                console.log(e);
                done();
            }
        
        }
            
    }
}