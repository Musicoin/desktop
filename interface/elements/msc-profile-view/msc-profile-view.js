var gui = require('nw.gui');
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
  handleSetCustomCoinbase: function() {
    this.$.setCoinbaseDialog.open();
  },
  showSendDialog: function(e) {
    this.$.sender.value = e.model.dataHost.dataHost.account.address;
    this.$.sendDialog.open();
  },
  addPeers: function(e) {
    // please update from bootnodes.json for every release
    var remoteNodes = [
      "enode://9f5d079dfe426b75238f011d17bb79ac019917c3ebb87b696b04cfeeb406b75aa636b265ec237cdc9115e472799b8ac91dc0b24145596fbe8a7ab35c2d840af5@35.187.221.137:30303",
      "enode://01389822f45080a202f5429d45975d96eea3be88e1af4686f7d1033345755fda8cc6eb07b3ef64fcd3c376e53a97d4e02170fc1a1f0f430ab41b43edeaedeeb0@35.187.205.215:30303",
      "enode://b6c3369280249b13ee893c551c01dbee33f9cecdfca8b63792b9703632d26ef428819f94d7a0d4d976411e5f81811e1823956debc91b5681e01834b6ba308af4@104.198.124.145:30303",
      "enode://d7cae2000e5fb894b0ae437b4b625fe3611e54a2452bc037223c2cfb92505b1441f5b22cbd541f977de835bf11ff1be60556487759effc2f5138e29aeb2fe44f@46.101.61.172:30303",
      "enode://ff403ec4a4d9d13fcaf79baf3fbdbf4b4459b67d04165407e6f05688f8ec4b044401352a71f459c8a73f82d8b3f42a6fcb90e48fcc835c82ebeca6fa91899b4c@163.172.70.26:47028",
      "enode://d7140927cc9bac8194ea7a376ad4e40f5c13edabc46aa64ce2a599e109b12d45c39f562694c9774f3afd0fa1f17eee18478884390983c20d5cea9693cacd753e@137.189.91.71:60240",
      "enode://8c256e6798cc50e32ba0fe6b727ccab3645b9532a444d986916052693ee0d2c7fd5dfd3286636d9e4e9a0d9b80bfe58dfee202fbbff64646231aca62bf4a1572@104.199.62.73:60424",
      "enode://5d7ad9e63236e6490038a59302c10394e2b760efd8d5639eb1214a99b6d18bce2cf6462b446da0aa9689459207e1ce4839d538278235f42bffb3c49f5f1b2b65@109.190.108.54:58439"
    ];
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
