module.exports = function(rpcProvider) {
  return {
    sendTip: function(licenseAddress, musicoin) {
      return rpcProvider.fnPool('finops', 'sendTip', null, {address: licenseAddress, musicoinAmount:musicoin});
    },
    loadHistory: function() {
      return rpcProvider.fnPool('finops', 'loadHistory', null, {});
    }
  }
};