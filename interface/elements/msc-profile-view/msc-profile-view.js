var gui = require('nw.gui');
var fs = require('fs');
var path = require('path');
var os = require('os');
var username1 = require('username');
Polymer({
  is: 'msc-profile-view',
  properties: {
    accounts: Array,
    username: String,
    userImage: String,
    locale: Object,
    txStatus: String,
    nodeId: String,
    actionState: {
      type: String,
      value: "None"
    }
  },
  attached: function() {},
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('syncStatus', function(oldValue, newValue) {
        if (newValue) {
          this.$.isMining.checked = newValue.mining;
        }
      }.bind(this));

    mscIntf.financialData.attach(this)
      .to('accounts')
      .to('coinbase');

    mscIntf.userPreferences.attach(this)
      .to('username')

    this.nodeId = "Fetching...";
    mscIntf.accountModule.getNodeId()
      .then(result => {
        this.nodeId = result;
      });
  },
  _updateUserName: function() {},

  changeCoinbase: function(e) {
    mscIntf.accountModule.setCoinbase(e.model.account.address);
  },
  toggleMiningState: function() {
    if (this.$.isMining.checked) {
      mscIntf.accountModule.startMining();
    } else {
      mscIntf.accountModule.stopMining();
    }
  },
  _computeCheckboxIcon: function(value) {
    return value ? "icons:check-box" : "icons:check-box-outline-blank";
  },
  handleNewAccount: function() {
    this.$.newAccountDialog.open();
  },
  handleAddPeer: function() {
    this.$.addPeerDialog.open();
  },
  backupWallet: function() {
    var platform = os.platform();
    username1().then(username1 => {
      if (platform.includes("win32")) {
        var pathOfKey = 'C:\\Users\\' + username1 + '\\AppData\\Roaming\\Musicoin\\keystore';
      } else if (platform.includes("darwin")) {
        var pathOfKey = '/Users/' + username1 + '/Library/Musicoin/keystore';
      } else if (platform.includes("linux")){ //linux
        var pathOfKey = '/' + username1 + '/.musicoin/keystore';
      }
      var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: "Please backup your key in a safe place to avoid it from being stolen. Otherwise, there is NO WAY to retrieve your lost funds." +
        " You can locate your keys in: \n" + pathOfKey + " directory."
};
      new Notification("Please backup your key", alert);
      gui.Shell.showItemInFolder(pathOfKey);
    });
  },
  handleSetCustomCoinbase: function() {
    this.$.setCoinbaseDialog.open();
  },
  showSendDialog: function(e) {
    this.$.sender.value = e.model.dataHost.dataHost.account.address;
    this.$.sendDialog.open();
  },
  showExplorerWindow: function(e) {
    gui.Window.open('https://orbiter.musicoin.org/addr/' + e.model.account.address,{position: 'center', width: 1000, height: 600});
  },
  addPeers: function(e) {
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
    var addresses = this.$.newPeerEnodeAddress.value;
    if (addresses) {
      var array = addresses.split(/[\n ,;]+/).map(s => s.trim()).filter(s => s)
        .map(peer => {
          if (peer.startsWith("admin.addPeer(") && peer.endsWith(")"))
            return peer.substring(15, peer.length - 2);
          return peer;
        })
      var finArray = array.concat(remoteNodes);
      if (array.length > 0) {
        mscIntf.accountModule.addPeers(finArray)
          .then(() => this.txStatus = "Connecting" + array.length + "peers along with default remore Nodes")
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = "Failed to add peer: " + err);
      } else {
        mscIntf.accountModule.addPeers(remoteNodes)
          .then(() => this.txStatus = "Default list of remote nodes loaded")
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = "Failed to load default list: " + err);
      }
      this.$.addPeerDialog.close();
      return;
    } else {
      this.txStatus = "No manual enodes provided. Loading default remote Node list";
      mscIntf.accountModule.addPeers(remoteNodes)
        .then(() => this.txStatus = "Default list of remote nodes loaded")
        .delay(5000)
        .then(() => this.txStatus = "")
        .catch(err => this.txStatus = "Failed to load default list: " + err);
      this.$.addPeerDialog.close();
      return;
    }
  },
  createNewAccount: function(e) {
    var v1 = this.$.newAccountPassword.value;
    var v2 = this.$.newAccountPasswordVerify.value;
    if (v1 == v2) {
      mscIntf.accountModule.createAccount(this.$.newAccountPassword.value)
        .then(account => this.txStatus = "Created account: " + account)
        .catch(err => this.txStatus = "Failed to create account: " + err);
      this.clearNewAccountFields();
      this.$.newAccountDialog.close();
    } else {
      alert("Passwords do not match!");
      return false;
    }

  },
  setCustomCoinbase: function() {
    if (this.$.customCoinbase.value && this.$.customCoinbase.value.trim().length > 0) {
      mscIntf.accountModule.setCoinbase(this.$.customCoinbase.value);
    }
  },
  sendCoins: function() {
    this.txStatus = "Sending coins...";
    mscIntf.accountModule.sendCoins(
      this.$.recipient.value,
      this.$.coins.value,
      this.$.sender.value,
      this.$.sendPassword.value
    ).
    then((tx) => {
        this.txStatus = "Waiting for transaction " + tx;
        return mscIntf.accountModule.waitForTransaction(tx);
      })
      .then(() => {
        this.txStatus = "Success!";
      })
      .delay(5000)
      .then(() => {
        this.txStatus = "";
      })
      .catch((err) => {
        this.txStatus = "Failed to send: " + err;
      });
    this.clearSendFields();
  },

  clearNewAccountFields: function() {
    this.$.newAccountPasswordVerify.value = "";
    this.$.newAccountPassword.value = "";
  },

  clearSendFields: function() {
    this.$.recipient.value = "";
    this.$.coins.value = "";
    this.$.sendPassword.value = "";
    this.$.sender.value = "";
  }
});
