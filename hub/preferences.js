var fs = require('fs');
var Promise = require('bluebird');
function PreferenceManager(userPreferences, musicoinService, dir) {
  this.userPreferences = userPreferences;
  this.currentAccount = null;
  this.musicoinService = musicoinService;
  this.preferenceDir = dir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

PreferenceManager.prototype.setCurrentAccount = function(account) {
  return this.loadPreferences(account)
    .bind(this)
    .then(function(storedPreferences) {
      this.currentAccount = account;
      this.userPreferences.following = storedPreferences.following || [];
      this.userPreferences.playlists = storedPreferences.playlists || [];
      this.userPreferences.favorites = storedPreferences.favorites || [];
      this.userPreferences.musicianMode = storedPreferences.musicianMode || false;
      this.userPreferences.registrationStatus = storedPreferences.registrationStatus || {};
      this.userPreferences.username = storedPreferences.username || "";
      this.userPreferences.userImage = storedPreferences.userImage || "../";
      console.log("Loaded preferences for " + account + ": " + JSON.stringify(storedPreferences));
      return this.musicoinService.loadMyProfile(account);
    })
    .then(function(registrationStatus) {
      console.log("Updating registration status for " + account + ": " + JSON.stringify(registrationStatus));
      this.userPreferences.registrationStatus = registrationStatus;
      // this.savePreferences();
    })
};

PreferenceManager.prototype.follow = function(artistAddress) {
  return this.addMember(this.userPreferences.following, artistAddress)
    .bind(this)
    .then(function(newList) {
      this.userPreferences.following = newList;
      return this.savePreferences();
    });
};

PreferenceManager.prototype.unfollow = function(artistAddress) {
  return this.removeMember(this.userPreferences.following, artistAddress)
    .bind(this)
    .then(function(newList) {
      this.userPreferences.following = newList;
      return this.savePreferences();
    });
};

PreferenceManager.prototype.addFavorite = function(contractAddress) {
  return this.addMember(this.userPreferences.favorites, contractAddress)
    .bind(this)
    .then(function(newList) {
      this.userPreferences.favorites = newList;
      return this.savePreferences();
    });
};

PreferenceManager.prototype.removeFavorite = function(contractAddress) {
  return this.removeMember(this.userPreferences.favorites, contractAddress)
    .bind(this)
    .then(function(newList) {
      this.userPreferences.favorites = newList;
      return this.savePreferences();
    });
};

PreferenceManager.prototype.addMember = function(oldList, item) {
  var list = (oldList || []).slice();
  var idx = list.indexOf(item);
  if (idx >= 0)
    return Promise.resolve(oldList);

  list.push(item);
  return Promise.resolve(list);
};

PreferenceManager.prototype.removeMember = function(oldList, item) {
  var list = (oldList || []).slice();
  var idx = list.indexOf(item);
  if (idx < 0)
    return Promise.resolve(oldList);

  list.splice(idx, 1);
  return Promise.resolve(list);
};


PreferenceManager.prototype.loadPreferences = function(account) {
  return new Promise(function(resolve, reject) {
    try {
      var file = this.getPreferenceFile(account);
      if (!fs.existsSync(file)) {
        resolve({});
      }
      else {
        resolve(JSON.parse(fs.readFileSync(file)));
      }
    } catch (e) {
      reject(e);
    }
  }.bind(this));
};

PreferenceManager.prototype.savePreferences = function() {
  return new Promise(function(resolve, reject) {
    try {
      fs.writeFileSync(this.getPreferenceFile(this.currentAccount), JSON.stringify(this.userPreferences));
      resolve();
    } catch (e) {
      reject(e);
    }
  }.bind(this));
};

PreferenceManager.prototype.getPreferenceFile = function(account) {
  return this.preferenceDir + "/" + account + ".json";
};

module.exports = PreferenceManager;