module.exports = function(rpcProvider) {
  return {
    togglePlayState:function(){
      return rpcProvider.fnPool('audio', 'togglePlayState');
    },
    playNext:function(){
      return rpcProvider.fnPool('audio', 'playNext');
    },
    playAll: function(items) {
      return rpcProvider.fnPool('audio', 'playAll', null, {items: items});
    },
    reportPlaybackPercentage: function(item, percentage) {
      return rpcProvider.fnPool('audio', 'reportPlaybackPercentage', null, {
          percentage: percentage,
          item: item
        });
    }
  }
};