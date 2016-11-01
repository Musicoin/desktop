module.exports = function(rpcProvider) {
  return {
    login: function(pwd) {
      return rpcProvider.fnPool('login', 'loginToDefault', null, {pwd: pwd});
    },
    createAccount: function(pwd) {
      return rpcProvider.fnPool('login', 'createAccount', null, {pwd: pwd});
    },
    selectAccount: function(account) {
      return rpcProvider.fnPool('login', 'selectAccount', null, {account: account});
    }
  }
};