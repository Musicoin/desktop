var Promise = require('bluebird');
var fs = require('fs');
var os = require('os');
var mkdirp = require('mkdirp');
var jsonio = require('./json-io.js');
var lineReader = require('reverse-line-reader');
var Queue = require('promise-queue');
Queue.configure(Promise);

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
  this.queue = new Queue(1, Infinity);

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
      var startingTransactionIndex = this.historyIndex.transactionIndex || 0;
      var startingBlockNumber = this.historyIndex.lastBlock;
      console.log("Starting up indexer at " + startingBlockNumber + ":" + startingTransactionIndex);
      this.loggerContract = this.web3.eth.contract(this.loggerAbi).at(this.loggerAddress);
      this.eventFilter = this.loggerContract.allEvents({fromBlock: this.historyIndex.lastBlock, toBlock:'latest'});

      this.eventFilter.watch(function(err, eventEntry) {
        if (err) {
          return console.log("Error while watching account history: " + err);
        }
        if (eventEntry.blockNumber <= startingBlockNumber && eventEntry.transactionIndex <= startingTransactionIndex) {
          return console.log("Skipping event that was already processed, " + eventEntry.blockNumber + ", " + eventEntry.transactionIndex);
        }

        // we need a queue because these events must be processed in order.
        this.queue.add(function() {
          console.log("Processing event: " + eventEntry.blockNumber + ":" + eventEntry.transactionIndex);
          return this.createLogEntry(eventEntry)
            .bind(this)
            .then(function(logEntry) {
              this.historyIndex.lastBlock = eventEntry.blockNumber;
              this.historyIndex.transactionIndex = eventEntry.transactionIndex;
              if (logEntry) {
                return new Promise(function(resolve, reject) {
                  this.logger.write(logEntry + '\n', "utf8", function(err) {
                    if (err) reject(err);
                    resolve();
                  });
                }.bind(this))
              }
            })
            .then(function() {
              return this.saveIndexState();
            })
            .then(function() {
              this.onChange(this.account, this.historyIndex.lastBlock, this.historyIndex.transactionIndex);
            });
        }.bind(this))
      }.bind(this));
    });
};

AccountHistory.prototype.createLogEntry = function(eventEntry) {
  if (eventEntry.event != 'playEvent' && eventEntry.event != 'tipEvent') {
    return Promise.resolve(false);
  }
  return this.getTransaction(eventEntry.transactionHash)
    .bind(this)
    .then(function(transaction) {
      var licenseContract = this.web3.eth.contract(this.licenseAbi).at(transaction.to);
      var workContract = this.web3.eth.contract(this.workAbi).at(licenseContract.workAddress());

      var context = {};
      return Promise.resolve(context)
        .bind(this)
        .then(function() {
          return this.extractArray(licenseContract.royalties);
        })
        .then(function(royalties) {
          context.royalties = royalties;
          return this.extractArray(licenseContract.contributors);
        })
        .then(function(contributors) {
          if (contributors.length > 0) {
            console.log("Found contributors: " + contributors.length);
          }
          context.contributors = contributors;
        })
        .then(function() {
          return Promise.promisify(licenseContract.owner)();
        })
        .then(function(owner) {
          context.owner = owner;
        })
        .then(function() {
          return Promise.promisify(this.web3.eth.getBlock)(eventEntry.blockNumber);
        })
        .then(function(block) {
          context.block = block;
        })
        .then(function() {
          var isRoyalty = context.royalties.indexOf(this.account) >= 0;
          var isContribution = context.contributors.indexOf(this.account) >= 0;
          var isOwner = this.account == context.owner;
          var isIncoming = isOwner || isRoyalty || isContribution;
          var isOutgoing = transaction.from == this.account;
          if (isOutgoing || isIncoming) {
            var output = {
              transactionHash: eventEntry.transactionHash,
              blockNumber: eventEntry.blockNumber,
              timestamp: context.block.timestamp,
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
            return JSON.stringify(output);
          }
          return false;
        });
    });
};

AccountHistory.prototype.extractArrayItem = function(provider, idx) {
  return new Promise(function(resolve, reject) {
    provider(idx, function(err, result) {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

AccountHistory.prototype.extractArray = function(provider, startIdx, result) {
  return new Promise(function(resolve, reject) {
    var output = result || [];
    var idx = startIdx || 0;
    this.extractArrayItem(provider, idx)
      .bind(this)
      .then(function(value) {
        if (value != "0x") {
          output.push(value);
          resolve(this.extractArray(provider, idx+1, output));
        }
        else {
          resolve(output);
        }
      });
  }.bind(this))
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
