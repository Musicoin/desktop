Polymer({
  is: 'msc-license-viewer',
  properties: {
    work: Object,
    license: Object,
    playbackPaymentPercentage: Number
  },
  ready: function() {
    mscIntf.audioHub.attach(this)
      .to('playbackPaymentPercentage');
  },
  showReadable: function() {
    this.hideAll();
    this.$.readable.style.display = 'block';
    this.$.readableTab.setAttribute('selected', true);
  },
  showLegal: function() {
    this.hideAll();
    this.$.legal.style.display = 'block';
    this.$.legalTab.setAttribute('selected', true);
  },
  showSource: function() {
    this.hideAll();
    this.$.source.style.display = 'block';
    this.$.sourceTab.setAttribute('selected', true);
  },
  hideAll: function(id) {
    this.$.legal.style.display = 'none';
    this.$.legalTab.removeAttribute('selected');

    this.$.readable.style.display = 'none';
    this.$.readableTab.removeAttribute('selected');

    this.$.source.style.display = 'none';
    this.$.sourceTab.removeAttribute('selected');
  },

})
