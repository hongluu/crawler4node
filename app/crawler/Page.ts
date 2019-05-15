export class Page {
    html: String | null
    urls: String [] | null
    url: String | null
    nerver: [] | undefined
    constructor(html: String | null, urls: any[] | null, url: String | null) {
        this.html = html;
        this.urls = urls;
        this.url = url;
    }

}