var fs = require('fs');
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

    var obj = JSON.parse(fs.readFileSync('bootnodes.json', 'utf-8'));
    var remoteNodes = [];
    for(var i = 0; i< obj['nodes'].length; i++) {
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
      return (100 * (this.syncStatus.currentBlock - start)) / (this.syncStatus.highestBlock - start);
    }
    return 0;
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
  }
});
