var request = require("request");
var fs = require("fs");
var tmp = require("tmp");
var Promise = require("bluebird");

function IPFSConnector(mschub) {
  this.ipfsEndpoint = "http://localhost:8080/ipfs/";
  this.ipfsAPIEndpoint = "http://localhost:5001/";
  this.ipfsAddUrl = this.ipfsAPIEndpoint + "api/v0/add";
  window.setInterval(function() {
    request(this.ipfsAddUrl, function (error, response, body) {
      if (error) {
        mschub.ipfsStatus = {connected: false, error: error};
      }
      else {
        mschub.ipfsStatus = {connected: true};
      }

    }.bind(this))
  }.bind(this), 5000);
}

IPFSConnector.prototype.asUrl = function (hash) {
  return this.ipfsEndpoint + hash;
};

IPFSConnector.prototype.addString = function (text) {
  return new Promise(function (resolve, reject) {
    try {
      var tmpobj = tmp.fileSync();
      console.log("File: " + tmpobj.name);
      fs.writeFileSync(tmpobj.name, text);
      return this.add(tmpobj.name).then(function (hash) {
        tmpobj.removeCallback();
        resolve(hash);
      });
    } catch (e) {
      reject(e);
    }
  }.bind(this));
};

IPFSConnector.prototype.add = function (path) {
  return new Promise(function (resolve, reject) {
    var req = request.post(this.ipfsAddUrl, function (err, resp, body) {
      if (err) {
        reject(err);
      } else {
        var ipfsHash = JSON.parse(body).Hash;
        resolve(ipfsHash);
        console.log(ipfsHash + ": " + path);
      }
    });
    req.form().append('file', fs.createReadStream(path));
  }.bind(this));
};

module.exports = IPFSConnector;