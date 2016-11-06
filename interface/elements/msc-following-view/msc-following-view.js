Polymer({
  is: 'msc-following-view',
  properties: {
    following: {
      type: Array,
      observer: "_followingChanged",
      value: []
    }
  },
  ready: function() {
    mscIntf.userPreferences.attach(this)
      .to('following');

    this.$.browse.addEventListener('selected', function(e) {
      mscIntf.audio.playAll(e.detail);
    });

    this.$.browse.addEventListener('play', function(e) {
      mscIntf.audio.playAll(e.detail);
    });

    this.$.browse.addEventListener('shuffle', function(e) {
      mscIntf.audio.shuffleAll(e.detail);
    });

    this.$.browse.addEventListener('delete', function(e) {
      mscIntf.profile.addToPlaylist("My Favorites", e.detail.contract_id);
    }.bind(this));

    this.$.browse.addEventListener('favorite', function(e) {
      mscIntf.profile.addToPlaylist("My Favorites", e.detail.contract_id);
    }.bind(this));

    this.$.browse.addEventListener('line2-selected', function(e) {
      mscIntf.catalog.loadArtist(e.detail.work.owner_address);
      this.selectedPage = 'artist';
    }.bind(this));
  },
  _followingChanged: function(newValue) {
    if (!this.following || this.following.length == 0) {
      this.groups = [];
      return;
    }

    var toViewItem = function(serverItem) {
      return {
        img: serverItem.work.image_url_https,
        line1: serverItem.song_name,
        line2: serverItem.artist_name,
        data: serverItem
      }
    };
    mscIntf.catalog.loadArtists(newValue)
      .bind(this)
      .then(function(results) {
        var groups = [];
        for (var artistId in results) {
          var artistResult = results[artistId];
          if (artistResult.new_releases.length > 0) {
            // TODO: Hack until API returns real data!
            var artistName = artistResult.new_releases[0].work.artist; // artistResult.name
            groups.push(
              {
                name:artistName,
                items:artistResult.new_releases.map(toViewItem),
                });
          }
        }
        this.groups = groups;
      })
  }
})
