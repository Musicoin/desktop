Polymer({
  is: 'msc-simple-login-view',
  properties: {
    selectedAccount: String
  },
  ready: function() {
    mscIntf.attach(this)
      .to('loginError', function (oldValue, newValue) {
        if (newValue) {
          alert("login failed!");
        }
      });

    mscIntf.financialData.attach(this)
      .to('selectedAccount');
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
  }
})
