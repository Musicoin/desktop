Polymer({
    is: 'msc-tx-view',
    properties: {
        transactionHistory: Array
    },
    ready: function() {
        mscIntf.attach(this)
          .to('transactionHistory')
    },
    isPlayOrTip: function(item) {
        return this.isPlay(item) || this.isTip(item);
    },
    isPlay: function(item) {
        return item.eventType == "play";
    },
    isTip: function(item) {
        return item.eventType == "tip";
    },
    isPayment: function(item) {
        return item.eventType == "payment";
    },
    isFromThisAddress: function(item) {
        return item.from == mscIntf.financialData.selectedAccount;
    },
    isToThisAddress: function(item) {
        // TODO: This isn't right, but for now the data is just dummy data, so this ensures
        // it's one of the other.  In the future, the txs will be filtered on this address so
        // if it isn't from this address and it isn't to this address, the something went wrong
        return !this.isFromThisAddress(item);
    }
})
