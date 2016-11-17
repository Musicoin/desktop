var Promise = require("bluebird");
var http = require('http');
var https = require('https');
var fs = require('fs');
var crypto = require('crypto');
var zlib = require('zlib');
var stream = require('stream');
var urls = require('url');
var algorithm = 'aes-256-ctr';
var constant = '36e6f1d1cd2ff2cd7bb75a359';
var tmp = require("tmp");

function LocalMediaServer(web3Connector) {
  this.web3Connector = web3Connector;

  var server = http.createServer(function (request, response) {
    var url = urls.parse(request.url, true);
    if (url.pathname != "/media") return;

    var licenseAddress = url.query.licenseAddress;
    var license = this.web3Connector.getLicenseContractInstance(licenseAddress);
    var resourceUrl = license.resourceUrl();
    if (!resourceUrl) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write("Contract did not have a resource URL" + "\n");
      response.end();
      return;
    }

    var onError = function (err) {
      console.log(err);
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(err + "\n");
      response.end();
    };

    if (resourceUrl.startsWith("ipfs://")) {
      console.log("Pass through");
      var hash = resourceUrl.substr("ipfs://".length);
      http.get('http://localhost:8080/ipfs/' + hash, function (proxyRes) {
        response.writeHead(200, proxyRes.headers);
        proxyRes.pipe(response);
      })
        .on('error', onError);
    }
    else {
      var work = this.web3Connector.getWorkContractInstance(license.workAddress());
      var password = this.computeKey(work.artist(), work.title());
      var decrypt = crypto.createDecipher(algorithm, password);
      if (resourceUrl.startsWith("eipfs://")) {
        console.log("Decrypting content and returning ");
        var hash = resourceUrl.substr("eipfs://".length);
        http.get('http://localhost:8080/ipfs/' + hash, function (proxyRes) {
          response.writeHead(200, proxyRes.headers);
          proxyRes.pipe(decrypt).pipe(response);
        })
          .on('error', onError);
      }
      else if (resourceUrl.startsWith("zeipfs://")) {
        console.log("Decrypting and unzipping content and returning ");
        var hash = resourceUrl.substr("zeipfs://".length);
        var unzip = zlib.createGunzip();
        http.get('http://localhost:8080/ipfs/' + hash, function (proxyRes) {
          response.writeHead(200, proxyRes.headers);
          proxyRes.pipe(decrypt).pipe(unzip).pipe(response);
        })
          .on('error', onError);
      }
      else {
        response.writeHead(404);
        response.write("Could not find resource for %s, resurceUrl was %s\n", licenseAddress, resourceUrl);
        response.end();
      }
    }
  }.bind(this));

  server.listen(function () {
    this.port = server.address().port;
    console.log("Server listening on: http://localhost:" + this.port);
  }.bind(this));
}

LocalMediaServer.prototype.getMediaUrlForLicense = function(licenseAddress) {
  return "http://localhost:" + this.port + "/media?licenseAddress=" + licenseAddress;
};

LocalMediaServer.prototype.computeKey = function(v1, v2) {
  var seed = v1 + " " + v2 + " " + constant;
  return crypto.createHash('md5').update(seed).digest("hex");
}

LocalMediaServer.prototype.encrypt = function(path, artist, title) {
  return new Promise(function(resolve, reject) {
    var password = this.computeKey(artist, title);
    var encrypt = crypto.createCipher(algorithm, password);
    tmp.file(function(err, tmpPath, fd, cleanupCallback) {
      if (err) return reject(err);
      var r = fs.createReadStream(path);
      var w = fs.createWriteStream(tmpPath);
      r.pipe(encrypt).pipe(w)
        .on('finish', function() {
          resolve(tmpPath);
        });
    });
  }.bind(this));
};

/*
 * Not using zipAndEncrypt right now, because I'm concerned how the progress is calculated by the HTML5
 * Audio tag.  If it is based on Content-Length, then it will be difficult to stream the response and give
 * an estimate of the length.  Given that our model is based on stream percentage, I'm hesitant to change
 * the file size too much.  Encryption alone should not (except for a few bytes of padding).
 *
 * http://stackoverflow.com/questions/93451/does-aes-128-or-256-encryption-expand-the-data-if-so-by-how-much
 */
LocalMediaServer.prototype.zipAndEncrypt = function(path, artist, title) {
  return new Promise(function(resolve, reject) {
    var password = this.computeKey(artist, title);
    var zip = zlib.createGzip();
    var encrypt = crypto.createCipher(algorithm, password);
    tmp.file(function(err, tmpPath, fd, cleanupCallback) {
      if (err) return reject(err);
      var r = fs.createReadStream(path);
      var w = fs.createWriteStream(tmpPath);
      r.pipe(zip).pipe(encrypt).pipe(w)
        .on('finish', function() {
          resolve(tmpPath);
        });
    });
  }.bind(this));
};

module.exports = LocalMediaServer;