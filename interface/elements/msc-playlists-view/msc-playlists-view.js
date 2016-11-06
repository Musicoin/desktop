Polymer({
  is: 'msc-playlists-view',
  properties: {
    playlists: Array,
    selectedPlaylist: {
      type: Object,
      value: null
    }
  },
  ready: function () {
    mscIntf.userPreferences.attach(this)
      .to('playlists', function (oldValue, newPlaylists) {
        if (newPlaylists) {
          var byName = {};
          var byFirstTrack = {};
          var firstLicenses = [];

          newPlaylists.forEach(function(playlist) {
            byName[playlist.name] = playlist;
            if (playlist.licenseIds[0])
              firstLicenses.push(playlist.licenseIds[0]);
              if (!byFirstTrack[playlist.licenseIds[0]])
                byFirstTrack[playlist.licenseIds[0]] = [];
              byFirstTrack[playlist.licenseIds[0]].push(playlist);
          });

          var detailByName = {};
          mscIntf.catalog.loadLicenses(firstLicenses)
            .bind(this)
            .then(function (details) {
              details.forEach(function(detail) {
                var affectedPlaylists = byFirstTrack[detail.contract_id];
                affectedPlaylists.forEach(function(playlist) {
                  detailByName[playlist.name] = detail;
                })
              });

              return newPlaylists.map(function(playlist) {
                var detail = detailByName[playlist.name];
                var url = detail ? detail.work.image_url_https : "";
                var length = playlist.licenseIds.length + " songs"; // TODO: i18n!
                return {
                  line1: playlist.name,
                  line2: length,
                  img: url,
                  data: playlist
                }
              });
            })
            .then(function (viewList) {
              this.set("playlists", [{name: "", items: viewList}]);
            });
        }
      }.bind(this))

    this.$.playlistsGrid.addEventListener('icons:delete', function (e) {
      var playlist = e.detail;
      mscIntf.profile.removePlaylist(playlist.name);
    }.bind(this));

    this.$.playlistsGrid.addEventListener('av:play-arrow', function (e) {
      var playlist = e.detail;
      mscIntf.catalog.loadLicenses(playlist.licenseIds)
        .bind(this)
        .then(function(details) {
          mscIntf.audio.playAll(details);
        })
    }.bind(this));

    this.$.playlistsGrid.addEventListener('av:shuffle', function (e) {
      var playlist = e.detail;
      var copy = playlist.licenseIds.slice();
      this.shuffle(copy);
      mscIntf.catalog.loadLicenses(copy)
        .bind(this)
        .then(function(details) {
          mscIntf.audio.playAll(details);
        })
    }.bind(this));

    this.$.playlistsGrid.addEventListener('selected', function (e) {
      this.selectedPlaylist = e.detail[0];
    }.bind(this));

    this.$.playlistEditor.addEventListener('back-clicked', function (e) {
      this.selectedPlaylist = null;
    }.bind(this));
  },
  shouldHideEditor: function () {
    return this.selectedPlaylist == null;
  },
  handleAddNewPlaylist: function() {
    var name = prompt("Enter a name");
    if (name) {
      mscIntf.profile.addPlaylist(name);
    }
  },
  shuffle: function (a) {
    var j, x, i;
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  }
});
