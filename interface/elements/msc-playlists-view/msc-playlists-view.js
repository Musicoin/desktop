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
      .to('playlists');

    this.$.playlistEditor.addEventListener('back-clicked', function (e) {
      this.selectedPlaylist = null;
    }.bind(this));
  },
  editPlaylist: function(e) {
    this.selectedPlaylist = e.detail;
  },
  shouldHideEditor: function () {
    return this.selectedPlaylist == null;
  },
  handleAddNewPlaylist: function() {
    var name = prompt("Enter a name");
    if (name) {
      mscIntf.profile.addPlaylist(name);
    }
  }
});
