module.exports = function(rpcProvider) {
  return {
    login: function(pwd) {
      return rpcProvider.fnPool('login', 'loginToDefault', null, {pwd: pwd});
    }
  }
};