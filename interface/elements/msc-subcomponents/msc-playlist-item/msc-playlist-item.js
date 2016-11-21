Polymer({
  is: 'msc-playlist-item',
  properties: {
    playlist: {
      type: Object,
      observer: "_playlistChanged"
    },
    maxItems: {
      type: Number,
      value: 10
    },
    licenses: Array
  },
  ready: function() {
    mscIntf.userPreferences.attach(this)
      .to("playlistEdit", function(oldValue, newValue) {
        if (this.playlist && newValue == this.playlist.name) {
          this._playlistChanged(this.playlist);
        }
      }.bind(this));

    mscIntf.audioHub.attach(this)
      .to('currentPlay', function(oldValue, newValue) {
        this.currentPlay = newValue;
        this.currentPlayId = (newValue && newValue.contract_id) ? newValue.contract_id : "none";
      }.bind(this));
  },
  editPlaylist: function() {
    this.fire('edit', this.playlist);
  },
  playAll: function() {
    this._playList(this.playlist.licenseIds);
  },
  playFrom: function(e) {
    var licenseIds = this.playlist.licenseIds.slice(e.model.index);
    this._playSelection(licenseIds);
  },
  shuffleAll: function() {
      mscIntf.catalog.loadLicenses(this.playlist.licenseIds)
        .bind(this)
        .then(function(details) {
          mscIntf.audio.shuffleAll(details);
        })
  },
  deletePlaylist: function() {
    mscIntf.profile.removePlaylist(this.playlist.name);
  },
  _playSelection: function(list) {
    if (list && list.length > 0) {
      this.currentPlayId = list[0];
    }
    mscIntf.catalog.loadLicenses(list)
      .bind(this)
      .then(function(details) {
        mscIntf.audio.playAll(details);
      })
  },
  _playlistChanged: function() {
    var idsToShow = this.playlist.licenseIds;
    if (idsToShow && idsToShow.length > this.maxItems) {
      idsToShow = idsToShow.slice(0, this.maxItems);
    }
    var licensePromises = idsToShow.map(function(id) {
      return mscIntf.catalog.loadLicense(id);
    });
    Promise.all(licensePromises)
      .then(function(results) {
        this.licenses = results;
      }.bind(this))
  },
  _computePlaylistImageUrl: function() {
    if (this.licenses && this.licenses.length > 0) {
      return this._computeImageUrl(this.licenses[0]);
    }
  },
  _computeImageUrl: function(license) {
    return mscIntf.clientUtils.resolveUrl(license.work.imageUrl);
  },
  _isSelected: function(license, currentPlayId) {
    return license && currentPlayId && license.address == currentPlayId;
  },
  _computeItemNumber: function(zeroBased) {
    return zeroBased + 1;
  }
});
