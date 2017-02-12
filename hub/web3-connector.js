const Promise = require('bluebird');
var Web3 = require('web3');
var request = require("request");

function Web3Connector(chainConfig, mschub, connectionCallback) {
  this.web3 = new Web3();
  this.rpcId = 1;
  console.log("connecting to web3");
  this.rpcServer = chainConfig.rpcServer;
  this.web3.setProvider(new this.web3.providers.HttpProvider(chainConfig.rpcServer));
  this.initialSyncStarted = false;
  this.initialSyncEnded = false;
  this.mchub = mschub;

  window.setInterval(function(){
    var wasConnected = this.connected;
    try {
      this.connected = this.web3.isConnected() && this.web3.eth;
      var newStatus = this.web3.eth.syncing ? this.web3.eth.syncing : {};
      newStatus.peers = this.web3.net.peerCount;
      newStatus.currentBlock = this.web3.eth.blockNumber;
      newStatus.syncing = !!this.web3.eth.syncing;
      if (newStatus.syncing && !this.initialSyncStarted)
        this.initialSyncStarted = true;
      if (!newStatus.syncing && this.initialSyncStarted && !this.initialSyncEnded)
        this.initialSyncEnded = true;
      newStatus.initialSyncStarted = this.initialSyncStarted;
      newStatus.initialSyncEnded = this.initialSyncEnded;
      newStatus.mining = this.web3.eth.mining;
      newStatus.hashrate = this.web3.eth.hashrate;
      mschub.syncStatus = newStatus;
      mschub.financialData.coinbase = this.getCoinbase();
      this.getAllAccountDetails()
        .then(accounts => mschub.financialData.accounts = accounts);
    }
    catch (e) {
      this.connected = false;
    }
    if (wasConnected != this.connected) {
      console.log("web3 connection status changed: " + JSON.stringify(newStatus));
      connectionCallback(this.connected);
    }
  }.bind(this), 1000);
}

Web3Connector.prototype.createAccount = function (pwd) {
  return new Promise(function(resolve, reject) {
    try {
      var newAccount = this.web3.personal.newAccount(pwd);
      return resolve(newAccount);
    } catch (e) {
      reject(e);
    }
  }.bind(this));
};

Web3Connector.prototype.rpcCall = function(method, params) {
  return new Promise(function (resolve, reject) {
    var headers = {
      'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/json-rpc',
      'Accept':'application/json-rpc'
    }
    var options = {
      url: this.rpcServer,
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        json: true,
        id: this.rpcId++
      })
    };
    request.post(options, function (err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  }.bind(this));
};

Web3Connector.prototype.startMining = function () {
  return this.rpcCall("miner_start", []);
};

Web3Connector.prototype.stopMining = function () {
  return this.rpcCall("miner_stop", []);
};

Web3Connector.prototype.getCoinbase = function () {
  return this.web3.eth.coinbase;
};

Web3Connector.prototype.setCoinbase = function (address) {
  return this.rpcCall("miner_setEtherbase", [address]);
};

Web3Connector.prototype.getAccounts = function () {
  return this.web3.eth.accounts;
};

Web3Connector.prototype.getDefaultAccount = function () {
  return this.web3.eth.defaultAccount || this.web3.eth.accounts[0];
};

Web3Connector.prototype.getAllAccountDetails = function() {
  const accounts = this.getAccounts();
  const coinbase = this.getCoinbase();
  const output = accounts.map(account =>
    this.getAccountDetails(account, coinbase)
      .then(details => {
        details.canSend = true;
        return details;
      }));

  if (accounts.indexOf(coinbase) < 0) {
    output.push(this.getAccountDetails(coinbase, coinbase)
      .then(details => {
        details.canSend = false;
        return details;
      }));
  }
  return Promise.all(output);
};

Web3Connector.prototype.getAccountDetails = function(account, _coinbase) {
  const coinbase = _coinbase ? _coinbase : this.getCoinbase();
  return this.getUserBalanceInMusicoin(account)
    .then((balance) => {
      return {
        address: account,
        displayBalance: this.mchub.clientUtils.formatBalance(balance),
        balance: balance,
        isCoinbase: account == coinbase
      }
    });
};

Web3Connector.prototype.getUserBalanceInMusicoin = function (account) {
  if (!this.connected) {
    return Promise.resolve(0);
  }
  return new Promise(function(resolve, reject) {
    this.web3.eth.getBalance(account, function(err, result) {
      if (err) {
        reject(err);
      }
      else {
        resolve(this.toMusicCoinUnits(result));
      }
    }.bind(this));
  }.bind(this));
};

Web3Connector.prototype.sendCoins = function (recipient, coins, from, pwd) {
  return this.unlockAccount(from, pwd)
    .bind(this)
    .then(function(account) {
      var params = {to: recipient, from: account, value: this.toIndivisibleUnits(coins), gas: 940000};
      return new Promise(function(resolve, reject) {
        return this.web3.eth.sendTransaction(params, function (err, tx) {
          if (err) reject(err);
          else resolve(tx);
        });
      }.bind(this))
    })
};

Web3Connector.prototype.unlockAccount = function (account, pwd) {
  // TODO: Switch to the method that doesn't require unlocking the account
  console.log("Unlocking account...");
  return new Promise(function (resolve, reject) {
    this.web3.personal.unlockAccount(account, pwd, 10, function(err, result) {
      if (result) {
        resolve(account);
      }
      else {
        reject(new Error("Unlocking account failed: " + err));
      }
    });
  }.bind(this));
};

Web3Connector.prototype.toMusicCoinUnits = function (indivisibleUnits) {
  return this.web3.fromWei(indivisibleUnits, 'ether');
};

Web3Connector.prototype.toIndivisibleUnits = function (musicCoins) {
  return this.web3.toWei(musicCoins, 'ether');
};

Web3Connector.prototype.waitForTransaction = function (expectedTx) {
  return new Promise(function(resolve, reject) {
    var count = 0;
    var filter = this.web3.eth.filter('latest');
    filter.watch(function (error, result) {
      if (error) console.log("Error: " + error);
      if (result) console.log("Result: " + result);
      count++;

      if (count > 10) {
        console.log("Giving up on tx " + expectedTx);
        reject(new Error("Transaction was not confirmed"));
        filter.stopWatching();
      }

      // each time a new block comes in, see if our tx is in it
      this.web3.eth.getTransactionReceipt(expectedTx, function(error, receipt) {
        if (receipt && receipt.transactionHash == expectedTx) {
          console.log("Got receipt: " + expectedTx + ", blockHash: " + receipt.blockHash);
          this.web3.eth.getTransaction(expectedTx, function (error, transaction) {
            if (transaction.gas == receipt.gasUsed) {
              // wtf?! This is the only way to check for an error??
              filter.stopWatching();
              reject(new Error("Out of gas (or an error was thrown)"));
            }
            else if (receipt.blockHash) {
              console.log("Confirmed " + expectedTx);
              console.log("Block hash " + receipt.blockHash);
              filter.stopWatching();
              resolve(receipt);
            }
            else {
              console.log("Waiting for confirmation of " + expectedTx);
            }
          }.bind(this));
        }
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Web3Connector.prototype.getWeb3 = function() {
  return this.web3;
};

module.exports = Web3Connector;
