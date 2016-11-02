module.exports = function(rpcProvider) {
  return {
    sendTip: function(licenseAddress, musicoin) {
      var tx = rpcProvider.fnPool('finops', 'sendTip', null, {address: licenseAddress, musicoinAmount:musicoin});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    send: function(recipientAddress, musicoin) {
      var tx = rpcProvider.fnPool('finops', 'send', null, {address: recipientAddress, musicoinAmount:musicoin});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    sendWei: function(recipientAddress, wei) {
      var tx = rpcProvider.fnPool('finops', 'send', null, {address: recipientAddress, weiAmount:wei});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    loadHistory: function() {
      var tx = rpcProvider.fnPool('finops', 'loadHistory', null, {});
      return rpcProvider.messageMonitor.waitForResult(tx);
    }
  }
};