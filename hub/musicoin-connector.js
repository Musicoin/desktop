var request = require("request");
var fs = require("fs");

function MusicoinConnector(server) {
  this.musicoinListURL = server + "/api/pages/list";
  this.musicoinContentURL = server + "/api/page/content";
  this.musicoinMyWorksURL = server + "/api/works/list";
  this.favoritesFile = 'favorites.json';
  this.playbackPaymentPercentage = 70;

  this.workTypes = {
    score: 0,
    lyrics: 1,
    recording: 2
  }
};

MusicoinConnector.prototype.loadMyWorks = function (address, callback) {
  var propertiesObject = {address: address};
  request({
    url: this.musicoinMyWorksURL,
    qs: propertiesObject,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200 && body && body.success) {
      callback(body.result);
    }
    else {
      console.log(error);
    }
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

module.exports = MusicoinConnector;