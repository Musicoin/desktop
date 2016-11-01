Polymer({
    is: 'msc-playlists-view',
    properties: {
      playlists: Array
    },
    ready: function() {
      mscIntf.attach(this)
        .to('selectedPlaylist')
        .to('playlists', function(oldValue, newValue) {
          if (!newValue) {
            this.playlists = [
              {
                name: "test",
                items: [{
                    line1: "Playlist1",
                    line2: "",
                    img: "https://ipfs.io/ipfs/QmVds4DjALnjxNjWMksySp7H4HGQtp7pkkbnLRuvkymnJn",
                    data: {}
                  }
                ]
            }];
            return;
          }
          this.playlists = [{name: "", items: newValue.map(function(playlist) {
            return {
              line1: playlist.title,
              line2: "xxx",
              img: playlist.image_url_https,
              data: playlist
            }
          })}];
        }.bind(this))
    }
});
