var request = require("request");
var fs = require("fs");

function MusicoinConnector(server, blockchain) {
  this.musicoinListURL = server + "/api/pages/list";
  this.musicoinContentURL = server + "/api/page/content";
  this.musicoinMyWorksURL = server + "/api/works/list";
  this.favoritesFile = 'favorites.json';
  this.playbackPaymentPercentage = 70;

  // TODO: Adding this for now to fill in some missing details
  this.blockchain = blockchain;

  this.workTypes = {
    score: 0,
    lyrics: 1,
    recording: 2
  }
};

MusicoinConnector.prototype.loadMyWorks = function (address) {
  return new Promise(function(resolve, reject) {
    var propertiesObject = {address: address};
    request({
      url: this.musicoinMyWorksURL,
      qs: propertiesObject,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200 && body && body.success) {
        resolve(body.result);
      }
      else {
        reject(error);
      }
    });
  }.bind(this))
  .then(function(myWorks) {
    // TODO: This is only until the API includes the contributor detail
    myWorks.forEach(function (w) {
      w.licenses.forEach(function(l) {
        var details = this.getPayoutDetails(l.contract_id);
        l.contributors = details.contributors;
        l.royalties = details.royalties;
      }.bind(this))
    }.bind(this));
    return myWorks;
  }.bind(this));
};

MusicoinConnector.prototype.loadBrowsePage = function (page, keywords, callback) {
  if (page == "favorites") {
    // TODO:
    // callback(this.loadFavoritesFromFile(callback));
    return;
  }

  var propertiesObject = {page_id: page, query: keywords};
  request({
    url: this.musicoinContentURL,
    qs: propertiesObject,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(body.content);
    }
    else {
      console.log(error);
    }
  }.bind(this))
};

MusicoinConnector.prototype.getPlaybackPaymentPercentage = function () {
  return this.playbackPaymentPercentage;
};

MusicoinConnector.prototype.addFavorite = function (address) {
  // TODO:
};

MusicoinConnector.prototype.loadBrowseCategories = function (callback) {
  request({
    url: this.musicoinListURL,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(body.pages);
    }
    else {
      console.log(error);
    }
  }.bind(this));
};

MusicoinConnector.prototype.loadMetadataFromUrl = function(url) {
  return new Promise(function (resolve, reject){
    return request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body);
      }
      else {
        console.log("Unable to load metadata: " + error);
        resolve([]);
      }
    }.bind(this))
  }.bind(this));
};

// TODO: Remove this once the API includes the required details
MusicoinConnector.prototype.getPayoutDetails = function (licenseAddress) {
  var license = this.blockchain.getLicenseContractInstance(licenseAddress);
  var _buildContributorsFromLicense = function (license) {

    var address;
    var output = [];
    for (var idx = 0; ((address = license.contributors(idx)) != "0x"); idx++) {
      output.push({
        address: address,
        shares: license.contributorShares(idx)
      });
    }
    return output;
  };

  var _buildRoyaltiesFromLicense = function (license) {
    var address;
    var output = [];
    for (var idx = 0; ((address = license.royalties(idx)) != "0x"); idx++) {
      output.push({
        address: address,
        amount: this.blockchain.toMusicCoinUnits(license.royaltyAmounts(idx))
      });
    }
    return output;
  }.bind(this);

  return ({
    contributors: _buildContributorsFromLicense(license),
    royalties: _buildRoyaltiesFromLicense(license),
  });
};

module.exports = MusicoinConnector;