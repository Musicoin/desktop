const Promise = require('bluebird');
const Web3 = require('web3');
const console = require('./console.log.js');
const etherSettings = require('./ether.settings.js')
const Hook = require('hooked-web3-provider');
const Lightwallet = require('eth-lightwallet');
Promise.promisifyAll(Lightwallet.keystore);

module.exports = (function (data) {
	var web3 = new Web3();
	var watchReadyInterval = null;
	var watchSyncInterval = null;
	var connected = false;
	var currentKeystore = null;
	var keystore = new Lightwallet.keystore();
	var hook = new Hook({
	  host: etherSettings.etherServerRpc,
	  transaction_signer: keystore
	});

	// to be supplied internationalized by app
	this.errors = {
		noConnection: 'Not connected to client. Cannot proceed',
		alreadyConnected: 'Already connected, disconnect first',
		accountIdx: 'Index of account does not match',
		accountOther: 'An error occured while selecting account. It states:\n',
	}
	Promise.promisifyAll(web3.eth);

	this.selectedAccount = null;

	this.chainConnect = function () {
		if (connected) return { error: this.error.alreadyConnected };
		web3.setProvider(hook);
		web3.currentProvider && web3.isConnected() && (connected = true, this.selectedAccount = this.getAccount());
		return web3.currentProvider && web3.isConnected() ? true : false;
	}
	this.chainDisconnect = function () {
		if (!connected) return { error: this.error.noConnection }
		web3.reset();
		web3.setProvider(null);
		return web3.currentProvider ? true : false; //console.log(web3.eth.getBlock("latest"));
	}
	this.createKeystore = function (pwd, notifyVarFn, notifyWindowFn) {
		console.log(pwd, notifyVarFn, notifyWindowFn);
		var seed = 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
		var nonce = 2;
		var password = 'b0a6ea25250a05d7134d512eb81e9d248e9823eb616b3809bc2aafd8669595fe'
		Lightwallet.keystore.createVaultAsync({
				password: password,
				seed: seed
			})
			.then(function (ks) {
				currentKeystore = ks;
        notifyVarFn(ks);
				Promise.promisifyAll(ks);
				return ks.keyFromPasswordAsync(password);
			})
			.then((pwDerivedKey)=>{
				currentKeystore.generateNewAddress(pwDerivedKey, 5);
				var addr = currentKeystore.getAddresses();
				notifyWindowFn(addr.length>0?true:false);
				// currentKeystore.passwordProvider = function (callback) {
				// 	var pw = prompt("Please enter password", "Password");
				// 	callback(null, pw);
				// };
				console.log(addr);
				// Now set ks as transaction_signer in the hooked web3 provider
				// and you can start using web3 using the keys/addresses in ks!
				//console.log('KS',ks.serialize());
				return currentKeystore.serialize();
			})
			.then((ser)=>{})//console.log('ser',ser))
      .catch((err) => {
				console.log(err);
				notifyVarFn(null);
      })
    return 'pending';
	};
	this.loadKeystoreAndRun = function (file) {

	}
	this.connectionNotifierReady = () => {
		try {
			this.notifiedExternalReadyVar !== null && this.notifiedExternalReadyVar(connected = web3.isConnected())
		} catch (err) {
			//no update here
		}
	}
	this.connectionNotifierSync = () => {
		try {
			var syncState = web3.eth.syncing;
			this.notifiedExternalSyncVar !== null && this.notifiedExternalSyncVar(syncState === false ? web3.eth.defaultBlock == 'latest' ? { start: web3.eth.blockNumber, current: web3.eth.blockNumber, max: web3.eth.blockNumber } : { start: 0, current: 0.0001, max: 1000000 } : { start: syncState.startingBlock, current: syncState.currentBlock, max: syncState.highestBlock })
		} catch (err) {
			//no update here
		}
	}
	this.watch = (watchReady, watchSync) => {
		notifiedExternalReadyVar = watchReady;
		notifiedExternalSyncVar = watchSync;
		watchReadyInterval = setInterval(() => {
			this.connectionNotifierReady();
		}, 500);
		//INFO: could use isSyncing here, but as many things in this ecosystem it's shitty. Provides no consistent info about node's state. So, doing it with syncing.
		watchSyncInterval = setInterval(() => {
			this.connectionNotifierSync();
		}, 1000);
	}
	this.unwatch = () => {
		clearInterval(watchReadyInterval);
		clearInterval(watchSyncInterval);
		notifiedExternalReadyVar = null;
		notifiedExternalSyncVar = null;
	}
	this.getAccount = function (idx) {
		if (!connected) return { error: this.error.noConnection }
		try {
			return idx === undefined ? web3.eth.defaultAccount || web3.eth.accounts[0] : (idx > web3.eth.accounts[0].length || idx < 0) ? { error: this.errors.accountIdx } : web3.eth.accounts[idx];
		} catch (err) {
			return { error: this.errors.accountOther, description: err }
		}
	}
	Promise.promisifyAll(this);
	return this;
})();
