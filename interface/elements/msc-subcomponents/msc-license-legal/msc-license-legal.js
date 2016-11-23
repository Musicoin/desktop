Polymer({
  is: 'msc-license-legal',
  properties: {
    work: Object,
    license: Object,
    playbackPaymentPercentage: Number
  },
  ready: function() {
    mscIntf.audioHub.attach(this)
      .to('playbackPaymentPercentage');
  }
})
