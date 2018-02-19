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
    return (this.syncStatus && this.syncStatus.syncing) ? document.querySelector("msc-introduction").echo('mainStatusJS_sync') + ((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2) + document.querySelector("msc-introduction").echo('mainStatusJS_sync_percent'): "";

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
    return document.querySelector("msc-introduction").echo('mainStatusJS_last_block') + this._timeSince(this.syncStatus.mostRecentBlockTime);
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
  echo: function(phrase) {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var settings = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\config\\settings.js';
      } else if (platform.includes("win32")) {
        var settings = process.env.APPDATA + '\\Musicoin\\config\\settings.js';
      } else if (platform.includes("darwin")) {
        var settings = process.env.HOME + '/Library/Musicoin/config/settings.js';
      } else if (platform.includes("linux")) { //linux
        var settings = process.env.HOME + '/.musicoin/config/settings.js';
      }
    var locales = process.cwd() + '/interface/styles/locales';
    lang = JSON.parse(fs.readFileSync(settings, 'utf-8'));
    var y18n = require('y18n')({ updateFiles: false, directory: locales, locale: lang.locale, fallbackToLanguage: "en" });
    return y18n.__(phrase + "");
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
