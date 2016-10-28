module.exports = function(rpcProvider) {
  return {
    loadBrowsePage: function(page, keyword) {
      return rpcProvider.fnPool('catalog', 'loadBrowsePage', null, {page:page, keyword: keyword});
    },
    loadMyWorks: function() {
      return rpcProvider.fnPool('catalog', 'loadMyWorks', null, {});
    },
    loadArtist: function(artistId) {
      return rpcProvider.fnPool('catalog', 'loadArtist', null, {artist_address:artistId});
    },
    releaseWork: function(work) {
      var tx = rpcProvider.fnPool('publish', 'releaseWork', null, {work:work});
      return rpcProvider.messageMonitor.waitForResult(tx);
    },
    releaseLicense: function(license) {
      var tx = rpcProvider.fnPool('publish', 'releaseLicense', null, {license:license});
      return rpcProvider.messageMonitor.waitForResult(tx);
    }
  }
};