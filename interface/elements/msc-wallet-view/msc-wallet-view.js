Polymer({
  is: 'msc-wallet-view',
  properties: {
    transactionHistory: Array,
    locale: Object
  },
  ready: function () {
    mscIntf.attach(this)
      .to('transactionHistory')
      .to('locale')
  },
  refresh: function () {
    mscIntf.payments.loadHistory();
  }
});
