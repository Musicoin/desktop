var request = require("request");
var fs = require("fs");
var Promise = require("bluebird");

function MusicoinConnector(server, blockchain) {
  this.musicoinListURL = server + "/api/pages/list";
  this.musicoinContentURL = server + "/api/page/content";
  this.musicoinMusicianURL = server + "/api/musician/content";
  this.musicoinLicenseDetailURL = server + "/api/license/detail";
  this.musicoinMyWorksURL = server + "/api/works/list";
  this.musicoinMyProfileURL = server + "/api/myProfile";
  this.musicoinMyHistoryURL = "http://blocks.musicoin.org/api/history/";
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
    myWorks.forEach(function (w) {
      w.licenses.forEach(function(l) {
        var details = this.getPayoutDetails(l);
        // this is a little messy.  API returns parallel arrays rather than a list of items,
        // but the app expected a list of items.  I'm combining the parallel arrays into a list of
        // items and replacing the existing property.  It might be better to create a new property.
        l.contributors = details.contributors;
        l.royalties = details.royalties;
        l.coinsPerPlay = this.blockchain.toMusicCoinUnits(l.wei_per_play);
      }.bind(this));
      if (w.licenses.length > 0) {
        w.license = w.licenses[0];
      }
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

MusicoinConnector.prototype.loadHistory = function (address) {
  var propertiesObject = {address: address};
  return new Promise(function (resolve, reject){
    return request({
      url: this.musicoinMyHistoryURL,
      qs: propertiesObject,
      json: true
    }, function (error, response, body) {
      if (!error && !body.success) {
        error = new Error(body.message);
      }

      if (!error && response.statusCode === 200) {
        resolve(body.history);
      }
      else {
        console.log("Unable to load artist: " + error);
        reject(error);
      }
    }.bind(this))
  }.bind(this));
};

MusicoinConnector.prototype.loadArtist = function(artist_address) {
  var propertiesObject = {address: artist_address};
  return new Promise(function (resolve, reject){
    return request({
      url: this.musicoinMusicianURL,
      qs: propertiesObject,
      json: true
    }, function (error, response, body) {
      if (!error && !body.success) {
        error = new Error(body.message);
      }

      if (!error && response.statusCode === 200) {
        resolve(body.content);
      }
      else {
        console.log("Unable to load artist: " + error);
        reject(error);
      }
    }.bind(this))
  }.bind(this));
};

MusicoinConnector.prototype.loadArtists = function(artist_addresses) {
  var promises = [];
  artist_addresses.forEach(function(artist_address) {
    promises.push(this.loadArtist(artist_address));
  }.bind(this));

  return Promise.all(promises)
    .then(function(allResults) {
      var output = {};
      artist_addresses.forEach(function (addr, idx) {
        output[addr] = allResults[idx];
      });
      return output;
    });
};

MusicoinConnector.prototype.loadLicenseDetails = function(contractIds) {
  // TODO: If we don't use the batch API, we can cache the response and use it offline
  var propertiesObject = {address: contractIds.join(',')};
  return new Promise(function (resolve, reject){
    return request({
      url: this.musicoinLicenseDetailURL,
      qs: propertiesObject,
      json: true
    }, function (error, response, body) {
      if (!error && !body.success) {
        error = new Error(body.message);
      }

      if (!error && response.statusCode === 200) {
        var sorter = {};
        var sorted = [];
        body.content.forEach(function(l) { sorter[l.contract_id] = l;});
        contractIds.forEach(function(id) {
          if (sorter[id]) {
            sorted.push(sorter[id]);
          }
        });
        resolve(sorted);
      }
      else {
        console.log("Unable to load licenses: " + error);
        reject(error);
      }
    }.bind(this))
  }.bind(this));
};

MusicoinConnector.prototype.loadMyProfile = function(address) {
  var propertiesObject = {address: address};
  return new Promise(function (resolve, reject){
    return request({
      url: this.musicoinMyProfileURL,
      qs: propertiesObject,
      json: true
    }, function (error, response, body) {
      if (!error && !body.success) {
        error = new Error(body.message);
      }

      if (!error && response.statusCode === 200) {
        resolve(body);
      }
      else {
        console.log("Unable to load profile: " + error);
        reject(error);
      }
    }.bind(this))
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

MusicoinConnector.prototype.getPayoutDetails = function (license) {
  var _buildContributorsFromLicense = function (license) {
    var address;
    var output = [];
    for (var idx = 0; license.contributors && idx < license.contributors.length; idx++) {
      output.push({
        address: license.contributors[idx],
        shares: license.contributor_shares[idx]
      });
    }
    return output;
  };

  var _buildRoyaltiesFromLicense = function (license) {
    var address;
    var output = [];
    for (var idx = 0; license.royalties && idx < license.royalties.length; idx++) {
      output.push({
        address: license.royalties[idx],
        amount: this.blockchain.toMusicCoinUnits(license.royalty_amounts[idx])

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