const events = require('events');
const ARequest = require('axios')

export default class AxiosSingleton {
    constructor(){
        if (!AxiosSingleton.instance) {
            AxiosSingleton.instance = ARequest;
        }
    }
    getInstance() {
        return AxiosSingleton.instance;
    }

}