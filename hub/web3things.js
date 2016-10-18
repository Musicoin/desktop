var Promise = require('bluebird');
var Web3 = require('web3');
var console = require('./console.log.js');
var etherSettings = require('./ether.settings.js')

module.exports = (function(data){
  var web3 = new Web3();
  var watchReadyInterval = null;
  var watchSyncInterval = null;
  Promise.promisifyAll(web3.eth);

  this.defaultAccount = null;

  this.chainConnect = function(){
    web3.setProvider(new Web3.providers.HttpProvider(etherSettings.etherServerRpc));
    web3.currentProvider && web3.isConnected() && (this.defaultAccount = web3.eth.defaultAccount || web3.eth.accounts[0]);
    return web3.currentProvider && web3.isConnected()?true:false;
  }
  this.chainDisconnect = function(){
    web3.reset();
    web3.setProvider(null);
    return web3.currentProvider?true:false;//console.log(web3.eth.getBlock("latest"));
  }
  this.connectionNotifierReady = ()=>{
    this.notifiedExternalReadyVar!==null && this.notifiedExternalReadyVar(web3.isConnected())
  }
  this.connectionNotifierSync = ()=>{
    var syncState = web3.eth.syncing;
    this.notifiedExternalSyncVar!==null && this.notifiedExternalSyncVar({start:syncState.startingBlock, current: syncState.currentBlock, max: syncState.highestBlock})
  }
  this.watch = (watchReady, watchSync)=>{
    notifiedExternalReadyVar = watchReady;
    notifiedExternalSyncVar = watchSync;
    watchReadyInterval = setInterval(()=>{
      this.connectionNotifierReady();
    },500);
    watchSyncInterval = setInterval(()=>{
      this.connectionNotifierSync();
    },1000);
  }
  this.unwatch = ()=>{
    clearInterval(watchReadyInterval);
    clearInterval(watchSyncInterval);
    notifiedExternalReadyVar = null;
    notifiedExternalSyncVar = null;
  }
  Promise.promisifyAll(this);
  return this;
})();
