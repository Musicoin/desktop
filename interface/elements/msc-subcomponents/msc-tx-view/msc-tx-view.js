Polymer({
  is: 'msc-tx-view',
  properties: {
    transactions: Array,
    startIndex: {
      type: Number,
      value: 0
    },
    pageSize : {
      type: Number,
      value: 100
    },
    local: Object
  },
  ready: function () {
    mscIntf.accountHistoryStatus.attach(this)
      .to('transactions')

    mscIntf.attach(this)
      .to('locale');
  },
  isPlayOrTip: function (item) {
    return this.isPlay(item) || this.isTip(item);
  },
  isPlay: function (item) {
    return item.eventType == "playEvent";
  },
  isTip: function (item) {
    return item.eventType == "tipEvent";
  },
  isPayment: function (item) {
    return item.eventType == "payment";
  },
  isFromThisAddress: function (item) {
    return item.outgoing;
  },
  isIncoming: function (item) {
    return item.incoming;
  },
  getSeedForIdenticon: function (item) {
    return item.from;
  },
  refresh: function () {
    this.startIndex = 0;
    this.updatePage();
  },
  _computeEventTypeLabel: function(eventType) {
    if (eventType == 'tipEvent') return 'tip';
    if (eventType == 'playEvent') return 'play';
    return eventType;
  },
  _computeDirectionText: function(item) {
    if (item.incoming && item.outgoing) return "in/out";
    if (item.incoming) return "in";
    return "out";
  },
  nextPage: function() {
  },
  previousPage: function() {
  },
  updatePage: function() {
  }
})
