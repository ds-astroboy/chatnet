import * as React from "react";
import axios from "axios";

export const getCurrenciesList = async ()  =>{
    const result = await axios.get(
        `https://api.coingecko.com/api/v3/coins/list`
    )
    const list = result.data.map((obj) => {
                    return {id: obj.id, symbol: obj.symbol};
                })
    return list;
}

export const getCurrencyInfo = async (currencyId: string, name: string) => {
    const result = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${currencyId}`
    )
    const solanaResult = await axios.get(
        `https://api.coingecko.com/api/v3/coins/solana`
    )
    const currentSolanaPrice = solanaResult.data.market_data.current_price.usd;
    const currentPrice = currencyId === "solana"? 1 : result.data.market_data.current_price.usd;
    const currencyToSolana = currentPrice / currentSolanaPrice;
    const percentChange1h = result.data.market_data.price_change_percentage_1h_in_currency.usd;
    const percentChange24h = result.data.market_data.price_change_percentage_24h;
    const highPrice = result.data.market_data.high_24h.usd;
    const lowPrice = result.data.market_data.low_24h.usd;
    const currencySymbol = name.toUpperCase();
    const marketCap = result.data.market_data.market_cap.usd;
    const currencyInfo = "<a className='mx_CurrencyName' href='https://www.coingecko.com/en/coins/" + currencyId + "'>$" + currencySymbol + "</a>"
        + "<p>💰Price [USDC]: $" + currentPrice + "</p>"
        + "<p>⚖️High: $" + highPrice + " | " + "Low: $" + lowPrice + "</p>"
        + "<p>🌞Price: [SOL]: " + currencyToSolana + "</p>"
        + "<p>📈1h: " + percentChange1h + "%" + " | " + "24h: " + percentChange24h + "%" + "</p>"
        + "<p>🌕Market Cap: " + marketCap + "</p>";
    
    return { msgtype: "m.text", body: currencyInfo, botType: "price_bot" };

}
export const priceBotCheck = async(content: string) => {
    let trimContent = content.replace("/", "").replaceAll(" ", "");
    const currencies = await getCurrenciesList();  
    let currencyIndex = -1;
    let currencyInfo;
    let currencyId;
    let currencyName;
    try {
        currencies.map((currency, index) => {
            if(currency.symbol === trimContent || currency.id === trimContent) {
                if(trimContent === "eth") {
                    currencyId = "ethereum";                    
                    currencyName = "Eth";
                }
                else {
                    currencyId = currency.id;
                    currencyName = currency.symbol;
                }
                currencyIndex = index;
            }
        })
    }
    catch(e) {
        currencyIndex = -1;
        console.log("Can't get currencies list.")
    }
    if(currencyIndex !== -1) {
        currencyInfo = await getCurrencyInfo(currencyId, currencyName);
    }
    return {isCurrency: (currencyIndex !== -1), currencyInfo};
}