import Crawler from "./crawler";

export default class ACrawler extends Crawler{
    _get_data(url){
        this.fs.appendFile(this.config.name + ".txt", url +"\n", () => { }); 
    }
}