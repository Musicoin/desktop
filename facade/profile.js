module.exports = function(rpcProvider) {
  return {
    follow: function(artist_address) {
      return rpcProvider.fnPool('profile', 'follow', null, {artist_address:artist_address});
    }
  }
};