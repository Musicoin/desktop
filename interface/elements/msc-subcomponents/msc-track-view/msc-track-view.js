Polymer({
    is: 'msc-track-view',
    properties: {
        currentPlay: Object
    },
    ready: function() {
        mscIntf.audioHub.attach(this)
          .to('currentPlay', function(oldValue, newValue) {
              this.currentPlay = newValue;
              console.log(newValue);
          }.bind(this))

    },
    goToArtistPage: function() {
        mscIntf.catalog.loadArtist(this.currentPlay.work.owner_address);
        document.querySelector('#app').setAttribute('selected-page','artist');
    }
})
