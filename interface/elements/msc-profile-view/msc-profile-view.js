var gui = require('nw.gui');
Polymer({
  is: 'msc-profile-view',
  properties: {
    accounts: Array,
    username: String,
    userImage: String,
    locale: Object,
    txStatus: String,
    actionState: {
      type: String,
      value: "None"
    }
  },
  attached: function() {
  },
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
  },
  _updateUserName: function() {
  },

  changeCoinbase: function(e) {
    mscIntf.accountModule.setCoinbase(e.model.account.address);
  },
  toggleMiningState: function() {
    if (this.$.isMining.checked) {
      mscIntf.accountModule.startMining();
    }
    else {
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
    var addresses = this.$.newPeerEnodeAddress.value;
    if (addresses) {
        var array = addresses.split(/[\n ,]+/).map(s => s.trim()).filter(s => s)
            .map(peer => {
              if (peer.startsWith("admin.addPeer(") && peer.endsWith(")"))
                return peer.substring(15, peer.length - 2);
              return peer;
            })
        if (array.length > 0) {
            mscIntf.accountModule.addPeers(array)
                .then(() => this.txStatus = array.length + " peer(s) will be contacted")
                .delay(5000)
                .then(() => this.txStatus = "")
                .catch(err => this.txStatus = "Failed to add peer: " + err);
        }
        this.$.addPeerDialog.close();
        return;
    }
    this.txStatus = "Please enter at least one enode address";
    this.$.addPeerDialog.close();
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
    }
    else {
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
