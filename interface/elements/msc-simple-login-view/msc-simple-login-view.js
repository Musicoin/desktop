Polymer({
  is: 'msc-simple-login-view',
  properties: {
    locale: Object,
    selectedAccountIndex: {
      type:String,
      observer: "_handleAccountChanged",
      value: 0
    },
    chainVersion: String,
    selectedAccount: String,
    accounts: Array,
    syncStatus: Object
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('chainVersion')
      .to('syncStatus')
      .to('loginError', function (oldValue, newValue) {
        if (newValue) {
          alert("login failed!");
        }
      });

    mscIntf.financialData.attach(this)
      .to('selectedAccount')
      .to('accounts', function(oldValue, newValue) {
        this.accounts = newValue;
        console.log("accounts: " + newValue)
      }.bind(this))
  },
  checkForEnter: function (e) {
    // check if 'enter' was pressed
    if (e.keyCode === 13) {
      mscIntf.login.login(this.$.loginPwd.value);
    }
  },
  hideLoginWindow: function() {
    // logged in as guest
    mscIntf.loggedIn = true;
  },
  createNewAccount: function() {
    var pwd = prompt("Create a new account by providing a strong password");
    if (pwd) {
      mscIntf.login.createAccount(pwd);
    }
  },
  _handleAccountChanged: function(selected, previous) {
    if (this.accounts) {
      mscIntf.login.selectAccount(this.accounts[selected]);
    }
  },
  _computeSelectedAccount: function() {
    return this.selectedAccount || "";
  },
  _computeSyncProgress: function() {
    if (this.syncStatus && !this.selectedAccount) {
      if (this.syncStatus.currentBlock > 0 && !this.syncStatus.syncing)
        return 100;

      var start = this.syncStatus.startingBlock;
      return (100 * (this.syncStatus.currentBlock - start)) / (this.syncStatus.highestBlock - start);
    }
    return 0;
  },
  _hideSyncingStatus: function() {
    if (this.selectedAccount) return true;
    if (!this.syncStatus) return false;

    return (this.syncStatus.currentBlock > 0 && !this.syncStatus.syncing)
        || this.syncStatus.initialSyncEnded;
  },
  _computeSyncStatusMessage: function() {
    if (this.syncStatus) {
      if (this.syncStatus.syncing) return "Downloading from the Musicoin network";
      return "Looking for peers";
    }
  }
});
