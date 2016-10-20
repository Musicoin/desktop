var Promise = require('bluebird');
var Web3 = require('web3');
var console = require('./console.log.js');
var etherSettings = require('./ether.settings.js')

module.exports = (function(data){
  var web3 = new Web3();
  var watchReadyInterval = null;
  var watchSyncInterval = null;
  var connected = false;
  // to be supplied internationalized by app
  this.errors = {
    noConnection:'Not connected to client. Cannot proceed',
    alreadyConnected:'Already connected, disconnect first',
    accountIdx:'Index of account does not match',
    accountOther:'An error occured while selecting account. It states:\n',
  }
  Promise.promisifyAll(web3.eth);

  this.selectedAccount = null;

  this.chainConnect = function(){
    if (connected) return {error: this.error.alreadyConnected};
    web3.setProvider(new Web3.providers.HttpProvider(etherSettings.etherServerRpc));
    web3.currentProvider && web3.isConnected() && (connected=true,this.selectedAccount = this.getAccount());
    return web3.currentProvider && web3.isConnected()?true:false;
  }
  this.chainDisconnect = function(){
    if (!connected) return {error:this.error.noConnection}
    web3.reset();
    web3.setProvider(null);
    return web3.currentProvider?true:false;//console.log(web3.eth.getBlock("latest"));
  }
  this.connectionNotifierReady = ()=>{
    try {
      this.notifiedExternalReadyVar!==null && this.notifiedExternalReadyVar(connected = web3.isConnected())
    } catch (err) {
      //no update here
    }
  }
  this.connectionNotifierSync = ()=>{
    try {
      var syncState = web3.eth.syncing;
      this.notifiedExternalSyncVar!==null && this.notifiedExternalSyncVar({start:syncState.startingBlock, current: syncState.currentBlock, max: syncState.highestBlock})
    } catch (err) {
      //no update here
    }
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
  this.getAccount = function(idx) {
    if (!connected) return {error:this.error.noConnection}
    try {
      return idx===undefined?web3.eth.defaultAccount || web3.eth.accounts[0]:(idx>web3.eth.accounts[0].length || idx<0)?{error:this.errors.accountIdx}:web3.eth.accounts[idx];
    } catch (err) {
      return {error:this.errors.accountOther, description:err}
    }
  }



  Promise.promisifyAll(this);
  return this;
})();
