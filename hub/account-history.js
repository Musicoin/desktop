var Promise = require('bluebird');
var fs = require('fs');
var os = require('os');
var mkdirp = require('mkdirp');
var jsonio = require('./json-io.js');
var lineReader = require('reverse-line-reader');

function AccountHistory(account, web3Connector, onChange) {
  this.web3Connector = web3Connector;
  this.onChange = onChange || function() {};
  this.web3 = web3Connector.getWeb3();
  this.account = account;
  this.workAbi = web3Connector.getWorkAbi();
  this.licenseAbi = web3Connector.getLicenseAbi();
  this.loggerAbi = web3Connector.getLoggerAbi();
  this.loggerAddress = web3Connector.getLoggerAddress();
  this.indexDir = os.homedir() + "/.musicoin/accounts/" + account + "/";
  this.indexName = this.indexDir + "history-status.json";
  this.logName = this.indexDir + "transactions.json";
  this.eventFilter = {stopWatching: function(){}};
  this.historyIndex = { lastBlock: 0 };
  this.logger = fs.createWriteStream(this.logName, { flags: 'a' });

  this.createDirIfNeeded = function(dir) {
    return new Promise(function(resolve, reject) {
      fs.exists(dir, function(exists) {
        if (exists) resolve(dir);
        else {
          mkdirp(dir, function(err, result) {
            return err
              ? reject(err)
              : resolve(dir)});
        }
      });
    })
  }
}

AccountHistory.prototype.getTransactions = function(offset, pageSize) {
  return new Promise(function(resolve, reject) {
    var output = [];
    var count = 0;
    fs.exists(this.logName, function(exists) {
      if (!exists) return resolve(output);

      lineReader.eachLine(this.logName, function(line, last) {
        if (!line || line.trim().length == 0) return;
        if (count++ >= offset) {
          try {
            output.push(JSON.parse(line));
          } catch (err) {
            console.log("Parsing line failed: " + line);
          }
        }
        if (last || output.length == pageSize) {
          resolve(output);
          return false; // stop reading
        }
      });
    }.bind(this));
  }.bind(this));
};

AccountHistory.prototype.startIndexing = function() {
  this.loadIndexState()
    .bind(this)
    .then(function(index) {
      this.historyIndex = index;
      return this.createDirIfNeeded(this.indexDir)
    })
    .then(function() {
      console.log("Starting up indexer at " + this.historyIndex.lastBlock + ":" + this.historyIndex.transactionIndex);
      this.loggerContract = this.web3.eth.contract(this.loggerAbi).at(this.loggerAddress);
      var startingTransactionIndex = this.historyIndex.transactionIndex || 0;
      var startingBlockNumber = this.historyIndex.lastBlock;
      this.eventFilter = this.loggerContract.allEvents({fromBlock: this.historyIndex.lastBlock, toBlock:'latest'});
      this.eventFilter.watch(function(err, eventEntry) {
        if (!err) {
          if (eventEntry.blockNumber > startingBlockNumber || eventEntry.transactionIndex > startingTransactionIndex) {
            this.logEvent(eventEntry)
              .bind(this)
              .then(function(updated) {
                this.historyIndex.lastBlock = eventEntry.blockNumber;
                this.historyIndex.transactionIndex = eventEntry.transactionIndex;
                return this.saveIndexState()
                  .bind(this)
                  .then(function() {
                    if (updated) {
                      this.onChange(this.account, this.historyIndex.lastBlock, this.historyIndex.transactionIndex);
                    }
                  });
                return false;
              })
          }
          else {
            console.log("Skipping event that was already processed, " + eventEntry.blockNumber + ", " + eventEntry.transactionIndex);
          }
        }
      }.bind(this));
    });
};

AccountHistory.prototype.logEvent = function(eventEntry) {
  if (eventEntry.event != 'playEvent' && eventEntry.event != 'tipEvent') {
    return Promise.resolve(false);
  }
  return this.getTransaction(eventEntry.transactionHash)
    .bind(this)
    .then(function(transaction) {
      var licenseContract = this.web3.eth.contract(this.licenseAbi).at(transaction.to);
      var workContract = this.web3.eth.contract(this.workAbi).at(licenseContract.workAddress());

      var royalties = this.extractArray(licenseContract.royalties);
      var contributors = this.extractArray(licenseContract.contributors);
      var isRoyalty = royalties.indexOf(this.account) >= 0;
      var isContribution = contributors.indexOf(this.account) >= 0;
      var isOwner = this.account == licenseContract.owner();
      var isIncoming = isOwner || isRoyalty || isContribution;
      var isOutgoing = transaction.from == this.account;
      if (isOutgoing || isIncoming) {
        var output = {
          transactionHash: eventEntry.transactionHash,
          blockNumber: eventEntry.blockNumber,
          from: transaction.from,
          to: transaction.to,
          eventType: eventEntry.event,
          wei: transaction.value,
          amount: this.web3Connector.toMusicCoinUnits(transaction.value),
          title: workContract.title(),
          artist: workContract.artist(),
          imgUrl: workContract.imageUrl(),
          imgUrlHttps: workContract.imageUrl().replace("ipfs://", "https://ipfs.io/ipfs/"),
          isRoyalty: isRoyalty,
          isOwner: isOwner,
          isContribution: isContribution,
          incoming: isIncoming,
          outgoing: isOutgoing // It can be both incoming and outgoing
        };
        var logText = JSON.stringify(output);
        this.logger.write(logText + '\n');
        return true;
      }
      return false;
    });
};

AccountHistory.prototype.extractArray = function(provider) {
  var output = [];
  var value = null;
  for (var idx=0; (value = provider(idx)) != "0x"; idx++) {
      output.push(provider(idx));
  }
  return output;
};

AccountHistory.prototype.getTransactionReceipt = function(tx) {
  return new Promise(function(resolve, reject) {
    this.web3.eth.getTransactionReceipt(tx, function(error, receipt) {
      if (error) reject(error);
      else resolve(receipt);
    })
  }.bind(this));
};

AccountHistory.prototype.getTransaction = function(tx) {
  return new Promise(function(resolve, reject) {
    this.web3.eth.getTransaction(tx, function(error, transaction) {
      if (error) reject(error);
      else resolve(transaction);
    })
  }.bind(this));
};

AccountHistory.prototype.stopIndexing = function() {
  this.eventFilter.stopWatching();
};

AccountHistory.prototype.saveIndexState = function() {
  return jsonio.saveObject(this.indexName, this.historyIndex);
};

AccountHistory.prototype.loadIndexState = function() {
  return jsonio.loadObject(this.indexName)
    .bind(this)
    .then(function(result) {
      if (!result) {
        return {
          lastBlock: 0
        };
      }
      else return result;
    })
};

module.exports = AccountHistory;
