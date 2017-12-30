var fs = require('fs');
var ngui = require('nw.gui');
var nwin = ngui.Window.get();

var timesync = require('timesync');
var ts = timesync.create({
  peers: ['216.239.35.0'], // time.google.com
  interval: 12000 // 2 minutes, sync once
});

ts.on('sync', function(mode) {
  if (mode == 'end') {
    // diff thing
    diff = this.checkTimeSync();

    var msg = 'You are ';
    if (diff > 0) {
      msg += diff + ' milliseconds after.';
    } else if (diff < 0) {
      msg += diff + ' milliseconds too early.';
    }
    if (diff != 0) {
      this.$.timeSyncDialog.open();
    } else {
      //alert("Works");
    }
    return msg;
  }
});

Polymer({
  is: 'msc-simple-login-view',
  properties: {
    accounts: String,
    username: String,
    userImage: String,
    txStatus: String,
    nodeId: String,
    locale: Object,
    chainVersion: String,
    version: String,
    accounts: Array,
    syncStatus: Object,
    firstBlock: {
      type: Number,
      value: -1
    },
    actionState: {
      type: String,
      value: "None"
    }
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('version')
      .to('chainVersion')
      .to('syncStatus')

    //nwin.maximize();
    setTimeout(function() {
    var obj = JSON.parse(fs.readFileSync('bootnodes.json', 'utf-8'));
    var remoteNodes = [];
    for (var i = 0; i < obj['nodes'].length; i++) {
      remoteNodes.push(obj['nodes'][i]);
    }
    //console.log(remoteNodes);
    mscIntf.accountModule.getNodeId()
      .then(result => {
        this.nodeId = result;
      });

    this.txStatus = "Loading default remote Node list";
    mscIntf.accountModule.addPeers(remoteNodes)
      .then(() => this.txStatus = "Default list of remote nodes loaded")
      .delay(5000)
      .then(() => this.txStatus = "")
      .catch(err => this.txStatus = "Failed to load default list: " + err);
    },20000);
  },
  hideSyncWindow: function() {
    mscIntf.hideSyncWindow = true;
  },
  _computeSyncProgress: function() {
    if (this.syncStatus) {
      if (!this.syncStatus.syncing)
        return 0;

      var start = this.syncStatus.startingBlock;
      //console.log((100 * (this.syncStatus.currentBlock - start)) / (this.syncStatus.highestBlock - start));
      //return (100 * (this.syncStatus.currentBlock - start)) / (this.syncStatus.highestBlock - start);
      return ((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock));
    }
    console.log('returning with nothing');
    return 0;
  },
  _computeIsSyncingText: function() {
    return (this.syncStatus && this.syncStatus.syncing) ? "Sync " + ((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2) + "%" : "Sync: 0%";
  },
  _hideSyncingStatus: function() {
    if (this._computeHideSyncStatus()) {
      mscIntf.hideSyncWindow = true;
      return true;
    }
    return false;
  },
  _computeHideSyncStatus: function() {
    if (!this.syncStatus) return false;

    if (this.firstBlock == -1) {
      this.firstBlock = this.syncStatus.currentBlock;
    }
    if (this.syncStatus.initialSyncEnded) {
      return true
    };
    // if this initial sync hasn't start (according to geth)
    // but we are getting new blocks, then move on
    if (!this.syncStatus.initialSyncStarted) {
      return this.syncStatus.currentBlock > this.firstBlock;
    }
    if (this.syncStatus.peers == 0) return false;
    return !this.syncStatus.syncing;
  },
  _computeSyncStatusMessage: function() {
    if (this.syncStatus) {
      if (this.syncStatus.syncing) return "Downloading from the Musicoin network";
      return "Looking for peers";
    }
  },
  _formatTime: function() {

    //console.log(Date.now());
    //console.log(ts.now());
    var diff = Date.now() - ts.now();
    //console.log('DIFF:', diff);
    var msg = 'You are ';
    if (diff > 0) {
      msg += diff + ' milliseconds after.';
    } else if (diff < 0) {
      msg += diff + ' milliseconds too early.';
    }
    if (diff != 0) {
      this.$.timeSyncDialog.open();
    } else {
      //alert("Works");
    }
    return msg;
  }
});

function checkTimeSync() {
  //console.log(Date.now());
  //console.log(ts.now());
  var diff = Date.now() - ts.now();
  //console.log('DIFF:', diff);
  var msg = 'You are ';
  if (diff > 0) {
    msg += diff + ' milliseconds after.';
  } else if (diff < 0) {
    msg += diff + ' milliseconds too early.';
  }
  return diff;
}
