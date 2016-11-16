var AccountHistory = require("./account-history.js");
var PropertyChangeSupport = require("./pcs.js");

function AccountHistoryManager(web3Connector) {
  this.web3Connector = web3Connector;
  this.accountHistory = null;
  this.status = {};
  this.pcs = new PropertyChangeSupport(this.status);
  this.pcs.addObservable('blockNumber', 0);
  this.pcs.addObservable('transactionIndex', 0);
  this.pcs.addObservable('selectedAccount', 0);
  this.pcs.addObservable('onUpdate', true, true);
  this.pcs.addObservable('transactions', []);
  this.pageSize = 100;
  this.offset = 0;

  this.historyChangeListener = function(account, block, txIndex) {
    this.status.blockNumber = block;
    this.status.transactionIndex = txIndex;
    this.status.onUpdate = true;
  }.bind(this);
}

AccountHistoryManager.prototype.setCurrentAccount = function(account) {
  return new Promise(function(resolve, reject) {
    if (this.accountHistory) {
      this.accountHistory.stopIndexing();
    }
    this.offset = 0;
    this.accountHistory = new AccountHistory(account, this.web3Connector, this.historyChangeListener);
    this.accountHistory.startIndexing();
    this.status.selectedAccount = account;
    resolve();
  }.bind(this));
};

AccountHistoryManager.prototype.nextPage = function() {
  this.offset += this.pageSize;
  return this.loadTransactions();
};

AccountHistoryManager.prototype.previousPage = function() {
  this.offset = Math.max(0, this.offset - this.pageSize);
  return this.loadTransactions();
};

AccountHistoryManager.prototype.loadTransactions = function() {
  return this.accountHistory.getTransactions(this.offset, this.pageSize)
    .bind(this)
    .then(function(result) {
      this.status.transactions = result;
    })
    .catch(function(e) {
      console.log("Could not load transactions: " + e);
    });
};

AccountHistoryManager.prototype.getStatus = function() {
  return this.status;
};

module.exports = AccountHistoryManager;