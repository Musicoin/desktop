const Promise = require('bluebird');
const Web3 = require('web3');
const console = require('./console.log.js');
const etherSettings = require('./ether.settings.js')
const Hook = require('hooked-web3-provider');
const Lightwallet = require('eth-lightwallet-nwjs');
const fs = require("fs");

Promise.promisifyAll(Lightwallet.keystore);

var loggerAddress_v2 = "0x525eA72A00f435765CC8af6303Ff0dB4cBaD4E44";

var loggerMvp2Abi = JSON.parse(fs.readFileSync('solidity/mvp2/MusicoinLogger.sol.abi'));
var pppMvp2Abi = JSON.parse(fs.readFileSync('solidity/mvp2/PayPerPlay.sol.abi'));
var pppMvp2Code = "0x" + fs.readFileSync('solidity/mvp2/PayPerPlay.sol.bin');
var workCode = "0x" + fs.readFileSync('solidity/mvp2/Work.sol.bin');
var workAbi = JSON.parse(fs.readFileSync('solidity/mvp2/Work.sol.abi'));

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

	this.sendTip  = function(licenseContractAddress, musicCoins, pwd) {
		// TODO: somehow we need to communicate progress back to the UI
		var callback = {
			onPaymentInitiated: function() { console.log("payment initiated ")},
			onStatusChange: function(status) { console.log("status changed: " + status)},
			onFailure: function(err) { console.log("Failed: " + err);},
			onPaymentComplete: function() { console.log("Success!")}
		};

		Lightwallet.keystore.deriveKeyFromPassword(pwd, function(err, pwDerivedKey) {
			if (err) {
				callback.onFailure(err);
			}
			else {
				var txOptions = {
					gasLimit: 940000,
					value: web3.toWei(musicCoins, 'ether'),
					to: licenseContractAddress
				}
				var registerTx = Lightwallet.txutils.functionTx(pppMvp2Abi, 'tip', [], txOptions);
				var signedRegisterTx = Lightwallet.signing.signTx(keystore, pwDerivedKey, registerTx, this.selectedAccount);

				// inject signedRegisterTx into the network...
				console.log('Signed register key TX: ' + signedRegisterTx);
				console.log('');
				this._handleTransactionResult(signedRegisterTx, callback);
			}
		}.bind(this));
	}

	this._handleTransactionResult = function(err, expectedTx, callback) {
		if (err) {
			callback.onFailure(err);
			return;
		}
		this.waitForTransaction(expectedTx, callback)
	};

	this.waitForTransaction = function(expectedTx, callback) {
		callback.onPaymentInitiated();
		callback.onStatusChange("Waiting for " + expectedTx + " ..." + "(0)");
		var filter = this.web3.eth.filter('latest');
		var count = 0;
		var that = this;
		filter.watch(function(error, result) {
			if (error) console.log("Error: " + error);
			if (result) console.log("Result: " + result);
			count++;

			var receipt = that.web3.eth.getTransactionReceipt(expectedTx);
			var transaction = that.web3.eth.getTransaction(expectedTx);
			if (receipt && transaction.gas == receipt.gasUsed) {
				// wtf?! This is the only way to check for an error??
				callback.onFailure(new Error("Out of gas (or an error was thrown)"), false);
				return;
			}
			callback.onStatusChange("Waiting for " + expectedTx + " ..." + "(" + count + ")");
			if (receipt && receipt.transactionHash == expectedTx) {
				if (receipt.blockHash) {
					console.log("Confirmed " + expectedTx);
					console.log("Block hash " + receipt.blockHash);
					callback.onPaymentComplete();
					filter.stopWatching();
				}
				else {
					console.log("Waiting for confirmation of " + expectedTx);
				}
			}

			if (count > 5) {
				callback.onFailure(new Error("Transaction was not confirmed"));
				filter.stopWatching();
			}
		});
	};

	Promise.promisifyAll(this);
	return this;
})();
