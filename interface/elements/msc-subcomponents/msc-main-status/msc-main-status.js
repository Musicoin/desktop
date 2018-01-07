Polymer({
  is: 'msc-main-status',
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
  _computeIsSyncingText: function() {
    return (this.syncStatus && this.syncStatus.syncing) ? "Sync " + ((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2) + "% complete": "";

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
    if (!this.syncStatus || !this.syncStatus.currentBlock) return "";
    return this.syncStatus.currentBlock.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  _formatHighBlockNumber: function() {
    if (!this.syncStatus || !this.syncStatus.highestBlock) return "";
    return "/" + this.syncStatus.highestBlock.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  _computeMiningTooltip: function() {
    return this._computeIsMining() ? "Mining, click to stop" : "Not mining, click to start";
  },
  toggleMiningState: function() {
    if (this._computeIsMining()) {
      mscIntf.accountModule.stopMining();
    } else {
      mscIntf.accountModule.startMining();
    }
  },
  _computeHashRate: function() {
    if (!this.syncStatus || !this.syncStatus.hashrate) return "";
    return this.formatHashRate(this.syncStatus.hashrate);
  },
  _computeTimeSinceLastBlockMessage: function() {
    //console.log(this.syncStatus);
    if (!this.syncStatus || !this.syncStatus.mostRecentBlockTime) return "";
    return "Last Block: " + this._timeSince(this.syncStatus.mostRecentBlockTime);
  },
  formatHashRate: function(value) {
    const lookup = ["h/s", "kh/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s"];
    var order = Math.min(Math.floor(Math.log10(value) / 3), lookup.length - 1);
    var mult = value / Math.pow(10, 3 * order);
    return this.formatNumber(mult, 1) + " " + lookup[order];
  },
  formatNumber: function(number, decimals) {
    return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  _timeSince: function(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    const intervals = [{
        value: 60,
        unit: "m"
      },
      {
        value: 60,
        unit: "h"
      },
      {
        value: 24,
        unit: "d"
      },
      {
        value: 30,
        unit: "mon"
      },
      {
        value: 12,
        unit: "yr"
      },
    ]
    let unit = "s";
    let value = seconds;
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      if (value > interval.value) {
        unit = interval.unit;
        value = value / interval.value;
      } else {
        break;
      }
    }

    const rounded = Math.round(value);
    return `${rounded}${unit}`;
  }
});
