# Crawler4nodejs

Crawler4nodejs is an open source web crawler for Node.js which provides a simple interface for crawling the Web.

## Table of content

- [Installation](#installation)
- [Run](#run)
- [Quickstart](#quickstart)   
- [License](#license)

## Installation
```
npm install crawler4nodejs
```
## RUN
#### Update scripts in package.json
```
  "scripts": {
    "start": "node -r esm index.js"
  }
```
#### Run
```
npm install
```
## Quickstart
You need to create a crawler class that extends Crawler. This class can override the `_process_data()` function.  

### Example
```js
import Crawler from "crawler4nodejs"
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
    // process error url
    _store_err_url(url){
        this.fs.appendFileSync("error.txt", url + "\n", () => { })
    }

}
```
```js
let tuoi_tre_config = {
  name: 'thanhnien_vn',
  origin_url: 'https://thanhnien.vn',
  should_visit_prefix: [ 'https://thanhnien.vn' ],
  page_data_prefix: [ 'https://thanhnien.vn' ],
  should_visit_pattern: '',
  page_data_pattern: '',
  max_depth: '0',
  time_delay: '0',
  content_selector: [
    { name: 'title', selector: '#storybox > h1' },
    {
      name: 'title',
      selector: '#chapeau > div,.l-content .details__content'
    }
  ],
  proxyl: { host: '', port: '0', auth: { username: '', password: '' } }
};

let crawler = new ACrawler(tuoi_tre_config);
crawler.start();
```


### Crawl depth
By default there is no limit on the depth of crawling. But you can limit the depth of crawling. For example, assume that you have a seed page "A", which links to "B", which links to "C", which links to "D". So, we have the following link structure:

A -> B -> C -> D

Since, "A" is a seed page, it will have a depth of 0. "B" will have depth of 1 and so on. You can set a limit on the depth of pages that crawler4j crawls. For example, if you set this limit to 2, it won't crawl page "D". To set the maximum depth you can use:
```js
let config = {
    ...
    max_depth:3
};
let crawler = new ACrawler(config, logger);
```

## License

Copyright (c) 2019 HongLM
