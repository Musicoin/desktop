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

PreferenceManager.prototype.addPlaylist = function(playlistName) {
  var list = (this.userPreferences.playlists|| []).slice();
  list.push({name:playlistName, licenseIds:[]});
  return Promise.resolve(list)
    .then(function(newList) {
      this.userPreferences.playlists = newList;
      return this.savePreferences();
    }.bind(this))
};

PreferenceManager.prototype.removePlaylist = function(playlistName) {
  var list = (this.userPreferences.playlists|| []).filter(function(p) { return p.name != playlistName});
  return Promise.resolve(list)
    .then(function(newList) {
      this.userPreferences.playlists = newList;
      return this.savePreferences();
    }.bind(this))
};

PreferenceManager.prototype.addToPlaylist = function(playlistName, licenseId, suppressDuplicates) {
  var list = (this.userPreferences.playlists|| []).slice();
  var selected = list.filter(function(playlist){ return playlist.name == playlistName})[0];
  if (!selected) {
    selected = {name:playlistName, licenseIds: []};
    list.push(selected);
  }

  if (!suppressDuplicates || selected.licenseIds.indexOf(licenseId) < 0)
    selected.licenseIds.push(licenseId);

  return Promise.resolve(list)
    .then(function(newList) {
      this.userPreferences.playlists = newList;
      return this.savePreferences();
    }.bind(this));
};

PreferenceManager.prototype.removeFromPlaylist = function(playlistName, licenseId) {
  var list = (this.userPreferences.playlists|| []).slice();
  list.forEach(function (playlist) {
    if (playlist.name == playlistName) {
      var idx = playlist.licenseIds.indexOf(licenseId);
      if (idx > -1) {
        playlist.licenseIds.splice(idx, 1);
      }
    }
  });
  return Promise.resolve(list)
    .bind(this)
    .then(function(newList) {
      this.userPreferences.playlists = newList;
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