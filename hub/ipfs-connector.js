var request = require("request");
var fs = require("fs");
var tmp = require("tmp");

function IPFSConnector() {
  this.ipfsEndpoint = "http://localhost:8080/ipfs/";
  this.ipfsAPIEndpoint = "http://localhost:5001/";
  this.ipfsAddUrl = this.ipfsAPIEndpoint + "api/v0/add";
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