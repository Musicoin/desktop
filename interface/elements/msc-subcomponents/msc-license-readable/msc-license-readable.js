Polymer({
  is: 'msc-license-readable',
  properties: {
    work: Object,
    playbackPaymentPercentage: Number
  },
  ready: function() {
    mscIntf.audioHub.attach(this)
      .to('playbackPaymentPercentage');
  },
  _computeTotalShares: function(contributors) {
    if (!contributors) return 0;
    var sum = 0;
    contributors.forEach(function(c) {
      sum += parseFloat(c.shares); // TODO: I don't understand why this is necessary...
    });
    return sum;
  },
  showLegalVersion: function() {

  },
  _resolveAddressToName: function(address) {
    // TODO: I'm not sure how this will work.
    return address;
  },
  isNotFirst: function(idx) {
    return idx > 0;
  },
  hasRoyalties: function(royalties) {
    return royalties && royalties.length > 0;
  }
});
