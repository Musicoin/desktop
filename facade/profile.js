module.exports = function(rpcProvider) {
  return {
    follow: function(artist_address) {
      return rpcProvider.fnPool('profile', 'follow', null, {artist_address:artist_address});
    },
    unfollow: function(artist_address) {
      return rpcProvider.fnPool('profile', 'unfollow', null, {artist_address:artist_address});
    },
    setMusicianMode: function(enabled) {
      return rpcProvider.fnPool('profile', 'setMusicianMode', null, {enabled:enabled});
    },
    setUsername: function(username) {
      return rpcProvider.fnPool('profile', 'setUsername', null, {username:username});
    },
    addPlaylist: function(playlistName) {
      var tx = rpcProvider.fnPool('profile', 'addPlaylist', null, {playlistName:playlistName});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    removePlaylist: function(playlistName) {
      var tx = rpcProvider.fnPool('profile', 'removePlaylist', null, {playlistName:playlistName});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    addToPlaylist: function(playlistName, licenseId, suppressDuplicates) {
      var tx = rpcProvider.fnPool('profile', 'addToPlaylist', null, {playlistName:playlistName, licenseId:licenseId, suppressDuplicates:!!suppressDuplicates});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    removeFromPlaylist: function(playlistName, licenseId) {
      var tx = rpcProvider.fnPool('profile', 'removeFromPlaylist', null, {playlistName:playlistName, licenseId:licenseId});
      return rpcProvider.messageMonitor.waitForResult(tx);
    }
  }
};