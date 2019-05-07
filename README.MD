# Crawler4nodejs

Crawler4nodejs is an open source web crawler for Node.js which provides a simple interface for crawling the Web.

## Table of content

- [Installation](#installation)
- [Quickstart](#quickstart)   
- [Crawl depth](#more-examples)
- [License](#license)

## Installation
```
npm install crawler4nodejs
```
## RUN
### Update scripts in package.json
```
  "scripts": {
    "start": "node -r esm index.js"
  }
```
### Run
```
npm install
```
## Quickstart
You need to create a crawler class that extends Crawler. This class can override the `get_data()` function.  

### Example
```
let config = {
    name: 'crawl-storage-1',
    origin_url: 'https://en.wikipedia.org',
    should_visit_prefix: ['https://en.wikipedia.org/'],
    page_data_prefix: ['https://en.wikipedia.org/wiki/'],
    max_depth:3
};

let crawler = new ACrawler(config, logger);
crawler.start();
```
```
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
```

### Crawl depth
By default there is no limit on the depth of crawling. But you can limit the depth of crawling. For example, assume that you have a seed page "A", which links to "B", which links to "C", which links to "D". So, we have the following link structure:

A -> B -> C -> D

Since, "A" is a seed page, it will have a depth of 0. "B" will have depth of 1 and so on. You can set a limit on the depth of pages that crawler4j crawls. For example, if you set this limit to 2, it won't crawl page "D". To set the maximum depth you can use:
```
let config = {
    ...
    max_depth:3
};
let crawler = new ACrawler(config, logger);
```

## License

Copyright (c) 2019 HongLM
