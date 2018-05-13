var rp = require('request-promise-native');
var CoinMarketCapUrl = "https://api.coinmarketcap.com/v1/ticker/musicoin/?limit=1";
module.exports = function(web3Connector, logDir) {
  return {
    convertToMusicoinUnits: function(wei) {
      return web3Connector.toMusicCoinUnits(wei);
    },
    getLogDir: function() {
      return logDir;
    },
    formatBalance: function(value) {
      return value;
    },
    formatBalanceUsd: function(value) {
      rp({url: CoinMarketCapUrl, json: true})
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(usd => usdValue = usd[0].price_usd)
      .catch(error => usdValue = "failed");
        usd = value * usdValue;
        if (usdValue != undefined && usdValue != "failed") {
          return "~ $ " + usd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
          return "API Connection Failed";
        }
    },
    formatBalanceBtc: function(value) {
      rp({url: CoinMarketCapUrl, json: true})
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(btc => btcValue = btc[0].price_btc)
      .catch(error => btcValue = "failed");
        btc = value * btcValue;
        if (btcValue != undefined && btcValue != "failed") {
          return "~ " + btc + " BTC";
        } else {
          return "API Connection Failed";
        }
    }
  }
};