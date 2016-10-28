Polymer({
  is: 'msc-artist-view',
  properties: {
      selectedArtist: Object,
      songs: Array,
      following: Array,
      locale: Object,
      tipStatus: {
        type: Number,
        value: 0
      }
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('selectedArtist', function(oldValue, newValue) {
        this.set("selectedArtist", newValue);
        this.tipStatus = 0;
        this.loadDummyData();
      }.bind(this))

    mscIntf.userPreferences.attach(this)
      .to('following');

    this.$.browse.addEventListener('selected', function (e) {
      mscIntf.audio.playAll(e.detail);
    });
  },
  follow: function() {
    mscIntf.profile.follow(this.selectedArtist.address);
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
  _computeTipPending: function() {
    return this.tipStatus == 1;
  },
  _computeTipFailed: function() {
    return this.tipStatus == 2;
  },
  _computeTipMessage: function() {
    if (!this.locale) return "";
    if (this.tipStatus == 0) return this.locale.artistView.labels.tip;
    if (this.tipStatus == 1) return this.locale.artistView.labels.tipPending;
    if (this.tipStatus == 2) return this.locale.artistView.labels.tipFailed;
    if (this.tipStatus == 3) return this.locale.artistView.labels.tipSuccess;
  },
  sendTip: function() {
    var tipAmountInMusicoin = 1;
    this.tipStatus = 1;
    mscIntf.payments.send(this.selectedArtist.address, tipAmountInMusicoin)
      .bind(this)
      .then(function(){
        this.tipStatus = 3;
      })
      .catch(function(err) {
        this.tipStatus = 2;
      });
  },
  loadDummyData: function() {
    // the browse view is generic, so it has its own object model
    if (!this.selectedArtist) return;

    var selected  = this.selectedArtist.address;
    var toViewItem = function(serverItem) {

      // TODO: Hack!  Just working around a dummy API
      if (serverItem.work.owner_address != selected)
        return null;

      return {
        img: serverItem.work.image_url_https,
        line1: serverItem.song_name,
        line2: serverItem.artist_name,
        data: serverItem
      }
    };

    var toViewGroup = function(serverGroup) {
      return {
        name: serverGroup.title,
        items: serverGroup.result.map(toViewItem).filter(function(v) { return v != null})
      }
    };

    if (mscIntf.catalogBrowseItems)
      this.songs = mscIntf.catalogBrowseItems.map(toViewGroup);
    else
      this.songs = [];
  }

})
