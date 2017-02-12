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
  handleSetCustomCoinbase: function() {
    this.$.setCoinbaseDialog.open();
  },
  showSendDialog: function(e) {
    this.$.sender.value = e.model.dataHost.dataHost.account.address;
    this.$.sendDialog.open();
  },
  createNewAccount: function() {
    mscIntf.accountModule.createAccount(this.$.newAccountPassword.value);
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
      })
  },
});
