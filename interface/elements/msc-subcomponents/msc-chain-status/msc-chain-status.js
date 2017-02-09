Polymer({
    is: 'msc-chain-status',
    properties: {
        syncStatus: Object,
        ipfsStatus: Object,
        version: String
    },
    ready: function() {
        mscIntf.attach(this)
          .to('syncStatus')
          .to('version')
          .to('chainVersion');
    },
    _computeIsSyncing: function() {
        return this.syncStatus && this.syncStatus.syncing;
    },
    _computeIsMining: function() {
        return this.syncStatus && this.syncStatus.mining;
    },
    _computePeerIcon: function() {
      if (!this.syncStatus || this.syncStatus.peers == 0) return "social:person-outline";
      if (this.syncStatus.peers == 1) return "social:person";
      return "social:people";
    },
    _formatBlockNumber: function() {
        if (!this.syncStatus || !this.syncStatus.currentBlock) return "0";
        return this.syncStatus.currentBlock.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    _computeMiningTooltip: function() {
        return this._computeIsMining() ? "Mining, click to stop" : "Not mining, click to start";
    },
    toggleMiningState: function() {
        if (this._computeIsMining()) {
            mscIntf.account.stopMining();
        }
        else {
            mscIntf.account.startMining();
        }
    },
    _computeHashRate: function() {
      if (!this.syncStatus || !this.syncStatus.hashrate) return "";
      return this.formatHashRate(this.syncStatus.hashrate);
    },
    formatHashRate: function(value) {
      const lookup = ["h/s", "kh/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s"];
      var order = Math.min(Math.floor(Math.log10(value)/3), lookup.length-1);
      var mult = value / Math.pow(10, 3*order);
      return this.formatNumber(mult, 1) + " " + lookup[order];
    },
    formatNumber: function(number, decimals) {
      return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});
