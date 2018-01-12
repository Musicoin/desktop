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
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(usd => usdValue = usd[0].price_usd)
      .catch(error => usdValue = 99);
      usd = value * usdValue;
      if (usdValue != 99) return usd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatBalanceBtc: function(value) {
      market.getTicker({ limit: 1, currency: 'musicoin' })
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(btc => btcValue = btc[0].price_btc)
      .catch(error => btcValue = 99);
      btc = value * btcValue;
      if (btcValue != 99) return btc;
    }
  }
};