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
    }
  }
};