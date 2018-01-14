var fs = require('fs');
var ngui = require('nw.gui');
var nwin = ngui.Window.get();
var ntpClient = require('ntp-client');

document.addEventListener("DOMContentLoaded", function(event) {
  var minutes = 0.1;
  var interval = minutes * 60 * 1000;
  setInterval(function() {
    document.querySelector("msc-simple-login-view")._formatTime();
  }, interval);
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
    var obj = JSON.parse(fs.readFileSync('bootnodes.json', 'utf-8'));
    var remoteNodes = [];
    for (var i = 0; i < obj['nodes'].length; i++) {
      remoteNodes.push(obj['nodes'][i]);
    }
    // alert(remoteNodes);
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
    var flag = 0;
    ntpClient.getNetworkTime("time.nist.gov", 123, function(err, date) {
      if (err) {
        console.error(err);
        return;
      }
      //console.log("Current time : ", date.getTime());
      //console.log("System time: ", Date.now());
      var diff = (date.getTime() - Date.now()) / 1000;
      var msg = 'Your computer time is ';
      if (diff < 0) {
        msg += diff + ' milliseconds after.';
      } else if (diff > 0) {
        msg += diff + ' milliseconds late';
      }
      msg += ' compared to network time'
      if ((diff > 1) || (diff < -1)) {
        document.getElementById("timeSyncDialog").open();
        new Notification(msg);
      } else {}
      return msg;
    });
  }
});
