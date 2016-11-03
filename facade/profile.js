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
  }
};