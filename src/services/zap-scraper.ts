const axios = require('axios');
const cheerio = require('cheerio');

export interface ProductInfo {
    title: string,
    priceRange : string
}
let productsInfoCache : Array<ProductInfo> = [];

export const scrape = async (keyword: string) : Promise<Array<ProductInfo>> => {
    try {
        productsInfoCache = [];
        const response = await axios.get(`https://www.zap.co.il/search.aspx?keyword=${keyword}`);
        const html = response.data;
        const $ = cheerio.load(html);
        const productsInfo = $('.SearchResultsMain .ProdInfo');
        const productsPrices = $('.SearchResultsMain .Prices');
        for (let i = 0 ; i < productsInfo.length ; i++) {
            const title = $(productsInfo[i]).find('.ProdInfoTitle').text().replace(/[^a-z0-9 ]/gi, '').trim();
            const priceRanges = $(productsPrices[i]).find('.pricesTxt').text().trim();
            productsInfoCache.push({title: title, priceRange: priceRanges})
        }
        return productsInfoCache;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getProductPriceRange = (productName: string) => {
    const index = productsInfoCache.findIndex(product => product.title === productName);
    if (index !== -1) {
        return productsInfoCache[index].priceRange;
    }
    return 'Product price not found';
}