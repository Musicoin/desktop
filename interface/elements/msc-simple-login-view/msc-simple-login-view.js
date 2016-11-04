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
    accounts: Array
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('chainVersion')
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
  }
})
