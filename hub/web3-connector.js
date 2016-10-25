var Web3 = require('web3');
var fs = require('fs');
var pppAbi = JSON.parse(fs.readFileSync('solidity/mvp1/PayPerPlay.sol.abi.json'));
var pppCode = "0x" + fs.readFileSync('solidity/mvp1/PayPerPlay.sol.bin');

var loggerAddress = "0x88Fc62CFAC71041f9704c122293e249110c8efbb";
var loggerAddress_v2 = "0x525eA72A00f435765CC8af6303Ff0dB4cBaD4E44";

var loggerMvp2Abi = JSON.parse(fs.readFileSync('solidity/mvp2/MusicoinLogger.sol.abi'));
var pppMvp2Abi = JSON.parse(fs.readFileSync('solidity/mvp2/PayPerPlay.sol.abi'));
var pppMvp2Code = "0x" + fs.readFileSync('solidity/mvp2/PayPerPlay.sol.bin');
var workCode = "0x" + fs.readFileSync('solidity/mvp2/Work.sol.bin');
var workAbi = JSON.parse(fs.readFileSync('solidity/mvp2/Work.sol.abi'));

function Web3Connector() {
    this.web3 = new Web3();
    console.log("connecting to web3")
    this.deployGas = 4700000;
    this.web3.setProvider(new this.web3.providers.HttpProvider('http://localhost:8545'));
    this.selectedAccount = this.getDefaultAccount();
}

Web3Connector.prototype.checkAuth = function(pwd) {
    return this.web3.personal.unlockAccount(this.selectedAccount, pwd, 0);
};

Web3Connector.prototype.getSelectedAccount = function() {
    return this.selectedAccount;
};

Web3Connector.prototype.getDefaultAccount = function() {
    return this.web3.eth.defaultAccount || this.web3.eth.accounts[0];
};

Web3Connector.prototype.getUserBalance = function() {
    return this.web3.eth.getBalance(this.selectedAccount);
};

Web3Connector.prototype.getWeiPerPlay = function(address) {
    return this.getLicenseContractInstance(address).weiPerPlay();
};

Web3Connector.prototype.ppp = function(pppRequest, pwd, callback) {
    this.unlockAccount(pwd)
        .then(function() {
            this._pppNoAuth(pppRequest, callback);
        }.bind(this))
        .catch(function(err) { callback.onFailure(err, true)});
};

Web3Connector.prototype._pppNoAuth = function(pppRequest, callback) {
    var contract = this.getLicenseContractInstance(pppRequest.to);
    var params = {from: this.selectedAccount, value: pppRequest.amount, gas: 940000};
    contract.play(params, function (err, tx) {
        this._handleTransactionResult(err, tx, callback)}.bind(this));
};

Web3Connector.prototype._handleTransactionResult = function(err, expectedTx, callback) {
    if (err) {
        callback.onFailure(err);
        return;
    }
    this.waitForTransaction(expectedTx, callback)
};

Web3Connector.prototype.unlockAccount = function(pwd) {
    console.log("Unlocking account...");
    return new Promise(function(resolve, reject) {
        var result = this.web3.personal.unlockAccount(this.selectedAccount, pwd, 10);
        if (result) {
            resolve(result);
        }
        else {
            reject(new Error("Unlocking account failed"));
        }
    }.bind(this));
};

Web3Connector.prototype.tip = function(tipRequest, pwd, callback) {
    this.unlockAccount(pwd)
        .then(function() {
            var contract = this.getLicenseContractInstance(tipRequest.to);
            var params = {from: this.selectedAccount, value: tipRequest.amount, gas: 940000};
            contract.tip(params, function (err, tx) {
                this._handleTransactionResult(err, tx, callback);
            }.bind(this));
        }.bind(this))
        .catch(function(err) { callback.onFailure(err, true)});
};

Web3Connector.prototype.getLicenseContractInstance = function(address) {
    return this.web3.eth.contract(this.getContractAbiFromCatalog(address)).at(address);
};

Web3Connector.prototype.getWorkContractInstance = function(address) {
    return this.web3.eth.contract(workAbi).at(address);
};

Web3Connector.prototype.getContractAbiFromCatalog = function(address) {
    // TODO: The abi of contracts will change depending on the version
    return pppMvp2Abi;
};

Web3Connector.prototype.toMusicCoinUnits = function(indivisibleUnits) {
    return this.web3.fromWei(indivisibleUnits, 'ether');
};

Web3Connector.prototype.toIndivisibleUnits = function(musicCoins) {
    return this.web3.toWei(musicCoins, 'ether');
};

Web3Connector.prototype.listLicensesForWork = function(workAddress) {
  return new Promise(function (resolve, reject) {
    var loggerContract = this.web3.eth.contract(loggerMvp2Abi).at(loggerAddress_v2);
    var block = this.web3.eth.blockNumber;
    var filter = loggerContract.licenseReleasedEvent({work: workAddress}, {fromBlock: 0, toBlock: block});

    // TODO: The filter above doesn't seem to work -- maybe they need to be indexed?
    var actualFilter = function(log) { return log.args.work == workAddress;}

    filter.get(function (error, logs){
      if (error) reject(error);
      resolve(logs.filter(actualFilter).map(function (log){return log.args.sender}));
    });
  }.bind(this));
};

Web3Connector.prototype.listRecentLicenses = function(numBlocks) {
  return new Promise(function (resolve, reject) {
    var loggerContract = this.web3.eth.contract(loggerMvp2Abi).at(loggerAddress_v2);
    var block = this.web3.eth.blockNumber;
    var filter = loggerContract.licenseReleasedEvent({}, {fromBlock: block-numBlocks, toBlock: block});
    filter.get(function (error, logs){
      if (error) reject(error);
      resolve(logs.map(function (log){return log.args.sender}));
    });
  }.bind(this));
};

Web3Connector.prototype.listWorksForOwner = function(ownerAddress) {
  return new Promise(function (resolve, reject) {
    var loggerContract = this.web3.eth.contract(loggerMvp2Abi).at(loggerAddress_v2);
    var block = this.web3.eth.blockNumber;
    var filter = loggerContract.workReleasedEvent({owner: ownerAddress}, {fromBlock: block-10000, toBlock: block});
    var actualFilter = function(log) { return log.args.owner == ownerAddress;}
    filter.get(function (error, logs){
      if (error) reject(error);
      resolve(logs.filter(actualFilter).map(function (log){return log.args.sender}));
    });
  }.bind(this));
};

Web3Connector.prototype.waitForTransaction = function(expectedTx, callback) {
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

Web3Connector.prototype.releaseWork = function(work, pwd, callback) {
    this.unlockAccount(pwd)
      .then(function() {
          var workContract = this.web3.eth.contract(workAbi);
          workContract.new(
            loggerAddress_v2,
            work.type,
            work.title,
            work.artist,
            work.imageUrl,
            work.metadataUrl,
            {
                from: this.selectedAccount,
                data: workCode,
                gas: this.deployGas
            }, function (e, contract){
                if (e) {
                    callback.onFailure(e);
                }
                else if (contract.address) {
                    callback.onSuccess(contract.address);
                }
                else {
                    callback.onTransaction(contract.transactionHash);
                }
            });
      }.bind(this))
      .catch(function(err) { callback.onFailure(err, true)});
};

Web3Connector.prototype.releaseLicense = function(releaseRequest, pwd, callback) {
  this.unlockAccount(pwd)
    .then(function() {
      var payperplayContract = this.web3.eth.contract(pppMvp2Abi);
      payperplayContract.new(
        loggerAddress_v2,
        releaseRequest.workAddress,
        this.toIndivisibleUnits(releaseRequest.coinsPerPlay),
        releaseRequest.resourceUrl,
        releaseRequest.metadataUrl,
        releaseRequest.royalties,
        releaseRequest.royaltyAmounts.map(this.toIndivisibleUnits),
        releaseRequest.contributors,
        releaseRequest.contributorShares,
        {
          from: this.selectedAccount,
          data: pppMvp2Code,
          gas: this.deployGas
        }, function (e, contract){
          if (e) {
            callback.onFailure(e);
          }
          else if (contract.address) {
            callback.onSuccess(contract.address);
          }
          else {
            callback.onTransaction(contract.transactionHash);
          }
        }.bind(this));
    }.bind(this))
    .catch(function(err) { callback.onFailure(err, true)});
};

module.exports = Web3Connector;