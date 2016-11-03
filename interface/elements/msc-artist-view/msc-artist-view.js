Polymer({
  is: 'msc-artist-view',
  properties: {
      selectedArtist: {
        type: Object,
        observer: "_loadSongs"
      },
      songs: Array,
      following: Array,
      locale: Object,
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('selectedArtist', function(oldValue, newValue) {
        this.set("selectedArtist", newValue);
        this.tipStatus = 0;
      }.bind(this))

    mscIntf.userPreferences.attach(this)
      .to('following');

    this.$.browse.addEventListener('selected', function (e) {
      mscIntf.audio.playAll(e.detail);
    });
  },
  follow: function() {
    if (!this.selectedArtist) return;
    if (this._isFollowing()) {
      mscIntf.profile.unfollow(this.selectedArtist.address);
    }
    else {
      mscIntf.profile.follow(this.selectedArtist.address);
    }
  },
  _isFollowing: function() {
    if (!this.following) return false;
    if (!this.selectedArtist) return false;
    return this.following.indexOf(this.selectedArtist.address) > -1;
  },
  _computeFollowText: function() {
    return this._isFollowing()
      ? this.locale.artistView.labels.following
      : this.locale.artistView.labels.follow;
  },
  _loadSongs: function() {
    // the browse view is generic, so it has its own object model
    if (!this.selectedArtist) return;

    var selected  = this.selectedArtist.address;
    var toViewItem = function(serverItem) {
      return {
        img: serverItem.work.image_url_https,
        line1: serverItem.song_name,
        line2: serverItem.artist_name,
        data: serverItem
      }
    };

    if (!this.selectedArtist.new_releases) return [];
    this.songs = [{name:"New Releases", items:this.selectedArtist.new_releases.map(toViewItem)}];
  }

})
