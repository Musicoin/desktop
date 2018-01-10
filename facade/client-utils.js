var CoinMarketCap = require('coinmarketcap-api');
var market = new CoinMarketCap();
module.exports = function(web3Connector, logDir) {
  return {
    convertToMusicoinUnits: function(wei) {
      return web3Connector.toMusicCoinUnits(wei);
    },
    getLogDir: function() {
      return logDir;
    },
    formatBalance: function(value) {
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatBalanceUsd: function(value) {
      market.getTicker({ limit: 1, currency: 'musicoin' })
      .then(result => resultObj = JSON.parse(JSON.stringify(result)))
      .then(usd => usdValue = JSON.parse(JSON.stringify(usd[0].price_usd)))
      .catch(error => console.log(error));
      usd = value * usdValue;
      return usd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
    },
    formatBalanceBtc: function(value) {
      market.getTicker({ limit: 1, currency: 'musicoin' })
      .then(result => resultObj = JSON.parse(JSON.stringify(result)))
      .then(btc => btcValue = JSON.parse(JSON.stringify(btc[0].price_btc)))
      .catch(error => console.log(error));
      btc = value * btcValue;
      return btc;
      
    }
  }
};