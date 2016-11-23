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
    version: String,
    selectedAccount: String,
    accounts: Array,
    syncStatus: Object
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('version')
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
    if (this.syncStatus) {
      if (!this.syncStatus.syncing)
        return 0;

      var start = this.syncStatus.startingBlock;
      return (100 * (this.syncStatus.currentBlock - start)) / (this.syncStatus.highestBlock - start);
    }
    return 0;
  },
  _hideSyncingStatus: function() {
    // this ensures that the syncScreen will only show for new users
    if (this.selectedAccount) return true;

    if (!this.syncStatus) return false;
    if (this.syncStatus.initialSyncEnded) { return true};
    if (!this.syncStatus.initialSyncStarted) return false;
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
