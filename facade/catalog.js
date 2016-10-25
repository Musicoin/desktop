module.exports = function(rpcProvider) {
  return {
    loadBrowsePage: function(page, keyword) {
      // TODO: Seems much more module to just whatever fnPool will call here...
      return rpcProvider.fnPool('catalog', 'loadBrowsePage', null, {page:page, keyword: keyword});
    }
  }
};