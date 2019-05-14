const { CuckooFilter } = require('bloom-filters')
export default class Filter{   
    constructor(option,){
        if(option){
            if(option.isUpdate){
                this.filter = this._init_update_filter(option.storage_path)
            }else{
                this.filter = this._init_first_filter(option.storage_path)
            }    
        }
    }
    _init_update_filter(json_filter_path) {
        return new CuckooFilter(300000, 400, 8);
    }
    _init_first_filter(json_filter_path) {
        try {
            let boomfile = this.fs.readFileSync(json_filter_path)
            let exported = JSON.parse(boomfile);
            return CuckooFilter.fromJSON(exported);
        } catch (e) {
            return new CuckooFilter(3000000, 400, 8);
        }
    }
    has(url) {
        return this.filter.has(url);
    }
    add(url){
        this.filter.add(url);  
    }
    remove(url){
        this.filter.remove(url);
    }
    saveAsJSON(){
        return this.filter.saveAsJSON();
    }
}