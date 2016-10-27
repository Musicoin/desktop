module.exports = function(rpcProvider) {
  return {
    loadBrowsePage: function(page, keyword) {
      return rpcProvider.fnPool('catalog', 'loadBrowsePage', null, {page:page, keyword: keyword});
    },
    loadMyWorks: function() {
      return rpcProvider.fnPool('catalog', 'loadMyWorks', null, {});
    },
    releaseWork: function(work) {
      return rpcProvider.fnPool('publish', 'releaseWork', null, {work:work});
    },
    releaseLicense: function(work, license) {
      return rpcProvider.fnPool('publish', 'releaseLicense', null, {work:work, license:license});
    }
  }
};