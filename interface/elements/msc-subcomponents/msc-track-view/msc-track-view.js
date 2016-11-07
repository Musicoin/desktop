Polymer({
  is: 'msc-track-view',
  properties: {
    currentPlay: Object,
    nextPlay: {
      type: Object,
      value: null
    }
  },
  ready: function () {
    mscIntf.audioHub.attach(this)
      .to('currentPlay', function (oldValue, newValue) {
        this.currentPlay = newValue;
        this.nextPlay = mscIntf.audioHub.playlist[0];
        console.log(newValue);
      }.bind(this))

  },
  goToArtistPage: function () {
    mscIntf.catalog.loadArtist(this.currentPlay.work.owner_address);
    mscIntf.selectedPage = 'artist';
  },
  _computeUpNextHidden: function () {
    return this.nextPlay == null;
  },
  _computeUpNextImage: function(){
    if (!this.nextPlay) return "";
    return this.nextPlay.work.image_url_https;
  },
  _computeUpNextSongName: function(){
    if (!this.nextPlay) return "";
    return this.nextPlay.song_name;
  },
  _computeUpNextArtistName: function(){
    if (!this.nextPlay) return "";
    return this.nextPlay.artist_name;
  },
  skipToNext: function() {
    mscIntf.audio.playNext();
  }
})
