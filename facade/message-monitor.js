var Promise = require("bluebird");
var stamp = new Date().getTime();
var messageCount = 0;

function MessageMonitor() {
  this.monitors = {};
}

MessageMonitor.prototype.create = function() {
  return stamp + ":" + messageCount++;
};

MessageMonitor.prototype.waitForResult = function(tx) {
  return new Promise(function(resolve, reject) {
    this.monitor(tx, function(err, result) {
      if (err) {
        reject(err);
      }
      else {
        resolve(result);
      }
    });
  }.bind(this))
};


MessageMonitor.prototype.monitor = function(tx, callback) {
  if (!this.monitors[tx]) {
    this.monitors[tx] = [];
  }
  this.monitors[tx].push(callback);
};

MessageMonitor.prototype.complete = function(tx, err, result) {
  var txMonitors = this.monitors[tx];
  if (txMonitors) {
    txMonitors.forEach(function(m) {
      m(err, result);
    });
  }
  delete this.monitors[tx];
};

MessageMonitor.prototype.success = function(tx, result) {
  this.complete(tx, null, result);
};

MessageMonitor.prototype.error = function(tx, err) {
  this.complete(tx, err, null);
};

module.exports = MessageMonitor;