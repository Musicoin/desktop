module.exports = function(rpcProvider) {
  return {
    loadBrowsePage: function(page, keyword) {
      return rpcProvider.fnPool('catalog', 'loadBrowsePage', null, {page:page, keyword: keyword});
    },
    loadMyWorks: function() {
      return rpcProvider.fnPool('catalog', 'loadMyWorks', null, {});
    }
  }
};