module.exports = function(rpcProvider) {
  return {
    sendTip: function(licenseAddress, musicoin) {
      return rpcProvider.fnPool('finops', 'sendTip', null, {address: licenseAddress, musicoinAmount:musicoin});
    },
    send: function(recipientAddress, musicoin) {
      var tx = rpcProvider.fnPool('finops', 'send', null, {address: recipientAddress, musicoinAmount:musicoin});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    loadHistory: function() {
      return rpcProvider.fnPool('finops', 'loadHistory', null, {});
    }
  }
};