module.exports = function(web3Connector) {
  return {
    createAccount: function(pwd) {
      return web3Connector.createAccount(pwd);
    },
    getAccounts: function() {
      return web3Connector.getAccounts()
    },

    getCoinbase: function() {
      return web3Connector.getCoinbase();
    },
    getNodeId: function() {
      return web3Connector.getNodeId();
    },
    getBalance: function(account) {
      return web3Connector.getUserBalanceInMusicoin(account);
    },
    addPeers: function(enode) {
      return web3Connector.addPeers(enode);
    },
    sendCoins: function(recipient, coins, from, pwd) {
      return web3Connector.sendCoins(recipient, coins, from, pwd);
    },
    waitForTransaction: function(tx) {
      return web3Connector.waitForTransaction(tx);
    }
  }
};