var Promise = require('bluebird');
var Web3 = require('web3');
var console = require('./console.log.js');
var etherSettings = require('./ether.settings.js')

module.exports = (function(data){
  var web3 = new Web3();
  var watchInterval = null;
  //var notifiedExternalVar = null;
  this.notifiedExternalVarFn = null;
  Promise.promisifyAll(web3.eth);
  this.chainConnect = function(){
    web3.setProvider(new Web3.providers.HttpProvider(etherSettings.etherServerRpc));
    return web3.currentProvider?true:false;
  }
  this.chainDisconnect = function(){
    web3.reset();
    web3.setProvider(null);
    return web3.currentProvider?true:false;//console.log(web3.eth.getBlock("latest"));
  }
  this.connectionNotifier = ()=>{
    this.notifiedExternalVar!==null && this.notifiedExternalVar(web3.isConnected())
  }
  this.watch = (watchVar)=>{
    notifiedExternalVar = watchVar;
    watchInterval = setInterval(()=>{
      this.connectionNotifier();
    },300);
  }
  this.unwatch = ()=>{
    clearInterval(watchInterval);
    notifiedExternalVar = null;
  }
  Promise.promisifyAll(this);
  return this;
})();
