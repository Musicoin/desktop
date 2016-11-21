var Promise = require('bluebird');
var fs = require('fs');
var os = require('os');
var jsonio = require('./json-io.js');

function LocalCatalog(web3, workAbi, licenseAbi, loggerAbi, loggerAddress) {
  this.web3 = web3;
  this.workAbi = workAbi;
  this.licenseAbi = licenseAbi;
  this.loggerAbi = loggerAbi;
  this.loggerAddress = loggerAddress;
  this.licenseEventList = ['licenseReleasedEvent'];
  this.indexName = os.homedir() + "/.musicoin/local-catalog.json";
  this.releaseEventFilter = {stopWatching: function(){}};
}

LocalCatalog.prototype.startIndexing = function() {
  this.loadIndexState()
    .bind(this)
    .then(function(index) {
      this.pppIndex = index;
      console.log("Starting up indexer...");
      this.loggerContract = this.web3.eth.contract(this.loggerAbi).at(this.loggerAddress);
      this.releaseEventFilter = this.loggerContract.allEvents({fromBlock: this.pppIndex.lastBlock, toBlock:'latest'});
      this.releaseEventFilter.watch(function(err, eventEntry) {
        if (!err) {
          if ('licenseReleasedEvent' == eventEntry.event) {
            this.updateLicense(eventEntry.args.sender, eventEntry.blockNumber)
              .bind(this)
              .then(function() {
                this.pppIndex.lastBlock = eventEntry.blockNumber;
              })
              .then(function() {
                this.saveIndexState();
              });
          }
        }
      }.bind(this));
    });
};

LocalCatalog.prototype.stopIndexing = function() {
  this.releaseEventFilter.stopWatching();
};

LocalCatalog.prototype.saveIndexState = function() {
  jsonio.saveObject(this.indexName, this.pppIndex);
};

LocalCatalog.prototype.loadIndexState = function() {
  return jsonio.loadObject(this.indexName)
    .bind(this)
    .then(function(result) {
      if (!result) {
        return {
          lastBlock: 0,
          contracts: {}
        };
      }
      else return result;
    })
};


LocalCatalog.prototype.loadWork = function(workAddress) {
  var c = Promise.promisifyAll(this.web3.eth.contract(this.workAbi).at(workAddress));
  return Promise.join(
    c.titleAsync(),
    c.artistAsync(),
    c.imageUrlAsync(),
    c.metadataUrlAsync(),
    function(title, artist, imageUrl, metadataUrl) {
      return {
        address: workAddress,
        title: title,
        artist: artist,
        imageUrl: imageUrl,
        metadataUrl: metadataUrl,
      }
    }
  )
};

LocalCatalog.prototype.loadLicense = function(licenseAddress) {
  var c = Promise.promisifyAll(this.web3.eth.contract(this.licenseAbi).at(licenseAddress));
  var contributorPromise = this.extractAddressAndValues(c.contributorsAsync, c.contributorSharesAsync, "shares");
  var royaltyPromise = this.extractAddressAndValues(c.royaltiesAsync, c.royaltyAmountsAsync, "amount");

  return Promise.join(
    c.workAddressAsync(),
    c.weiPerPlayAsync(),
    c.tipCountAsync(),
    c.totalEarnedAsync(),
    c.ownerAsync(),
    c.resourceUrlAsync(),
    c.metadataUrlAsync(),
    contributorPromise,
    royaltyPromise,

    function(workAddress, weiPerPlay, tipCount, totalEarned, owner, resourceUrl, metadataUrl, contributors, royalties) {
      return {
        address: licenseAddress,
        contract_id: licenseAddress,
        workAddress: workAddress,
        weiPerPlay: weiPerPlay,
        coinsPerPlay: this.web3.fromWei(weiPerPlay, 'ether'),
        tipCount: tipCount,
        totalEarned: totalEarned,
        owner: owner,
        resourceUrl: resourceUrl,
        metadataUrl: metadataUrl,
        contributors: contributors,
        royalties: royalties
      }
    }.bind(this))
    .bind(this)
    .then(function(license) {
      return this.loadWork(license.workAddress)
        .then(function(work) {
          license.work = work;
          return license;
        });
    })
    .then(function(license) {
      console.log("Loaded license: " + JSON.stringify(license));
      return license;
    });
};

LocalCatalog.prototype.extractAddressAndValues = function(addressArray, valueArray, valueName) {
  var ctx = {};
  return this.extractAddressArray(addressArray, 0)
    .bind(this)
    .then(function(addresses) {
      ctx.addresses = addresses;
      return this.extractArray(valueArray, addresses.length);
    })
    .then(function(values) {
      return ctx.addresses.map(function(address, idx) {
        var output = {};
        output["address"] = address;
        output[valueName] = values[idx];
        return output;
      });
    });
};

LocalCatalog.prototype.extractArray = function(provider, length) {
  var promises = [];
  for (var idx=0; idx < length; idx++) {
    promises.push(provider(idx));
  }
  return Promise.all(promises);
};

LocalCatalog.prototype.extractAddressArray = function(provider, startIdx, result) {
  return new Promise(function(resolve, reject) {
    var output = result || [];
    var idx = startIdx || 0;
    provider(idx)
      .bind(this)
      .then(function(value) {
        if (value != "0x") {
          output.push(value);
          resolve(this.extractAddressArray(provider, idx+1, output));
        }
        else {
          resolve(output);
        }
      });
  }.bind(this))
};


LocalCatalog.prototype.updateLicense = function(licenseAddress, blockNumber) {
  return new Promise(function(resolve, reject) {
    var licenseContract = this.web3.eth.contract(this.licenseAbi).at(licenseAddress);
    var licenseObject = this.pppIndex.contracts[licenseAddress];
    if (!licenseObject) {
      // TODO: Stop using contract_id
      licenseObject = {address: licenseAddress, contract_id: licenseAddress};
      licenseObject.work = this.loadWorkFromAddress(licenseContract.workAddress());
      licenseObject.blockNumber = blockNumber;
      this.pppIndex.contracts[licenseAddress] = licenseObject;
    }
    this.updateFields(licenseObject, licenseContract, ['weiPerPlay', 'tipCount', 'totalEarned', 'owner', 'resourceUrl', 'metadataUrl']);
    resolve(licenseObject);
  }.bind(this))
};

LocalCatalog.prototype.loadWorkFromAddress = function(workAddress) {
  var workContract = this.web3.eth.contract(this.workAbi).at(workAddress);
  return this.updateFields({address: workAddress}, workContract, ['title', 'artist', 'imageUrl', 'metadataUrl']);
};

LocalCatalog.prototype.updateFields = function(output, contract, fields) {
  fields.forEach(function(f) {
    try {
      output[f] = contract[f]();
      if (output[f] && typeof(output[f]) === 'string' && output[f].startsWith("ipfs://")) {
        output[f + "_https"] = output[f].replace("ipfs://", "https://ipfs.io/ipfs/");
      }
    }
    catch(e) {
      console.log("Could not read field from contract: " + f + ", contract: " + contract.address);
    }

  });
  return output;
};

module.exports = LocalCatalog;
