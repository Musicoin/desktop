Polymer({
  is: 'msc-playlist-editor-view',
  properties: {
    playlist: {
      type: Array,
      value: [],
      observer: "_playlistChanged"
    },
    groups: Array
  },
  ready: function() {
    this.$.browse.addEventListener('selected', function(e) {
      mscIntf.audio.playAll(e.detail);
    });

    mscIntf.userPreferences.attach(this)
      .to("playlistEdit", function(oldValue, newValue) {
        if (this.playlist && newValue == this.playlist.name) {
          this._playlistChanged(this.playlist);
        }
      }.bind(this));

    this.$.browse.addEventListener('icons:delete', function (e) {
      mscIntf.profile.removeFromPlaylist(this.playlist.name, e.detail.contract_id);
    }.bind(this));
  },
  _playlistChanged: function(newPlaylist) {
    if (!newPlaylist || !newPlaylist.licenseIds || newPlaylist.licenseIds.length == 0) {
      this.set("groups", [{name:"", items:[]}]);
      return;
    }

    mscIntf.catalog.loadLicenses(newPlaylist.licenseIds)
      .bind(this)
      .then(function(details) {
        return details.map(function(licenseDetails) {
          return {
            line1: licenseDetails.work.title,
            line2: licenseDetails.work.artist,
            img: licenseDetails.work.image_url_https,
            data: licenseDetails
          }
        })
      })
      .then(function(viewList) {
        this.set("groups", [{name:"", items:viewList}]);
      });
  },
  handleBackClick: function () {
    this.fire('back-clicked');
  },
});
