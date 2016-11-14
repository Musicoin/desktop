var gui = require('nw.gui');
Polymer({
  is: 'msc-profile-view',
  properties: {
    musicianMode: Boolean,
    registrationStatus: Object,
    selectedAccount: String,
    username: String,
    userImage: String,
    locale: Object,
    actionState: {
      type: String,
      value: "None"
    }
  },
  attached: function() {
    this.actionHandlers = {
      "external-link": function(action) {this.handleExternalLinkAction(action)}.bind(this),
      "app-link": function(action) {this.handleAppLinkAction(action)}.bind(this),
      "send": function(action) {this.handleSendAction(action)}.bind(this),
    };
    this.errorHandler = function(action) {
      console.log("Could not handle action: " + JSON.stringify(action));
    }
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
      .to('selectedAccount');

    mscIntf.userPreferences.attach(this)
      .to('musicianMode')
      .to('username')
      .to('userImage')
      .to('registrationStatus');
  },
  _updateUserName: function() {
    mscIntf.profile.setUsername(this.$.usernameLabel.innerText);
  },
  _isActionPending: function() {
    return "pending" == this.actionState;
  },
  _isActionFailed: function() {
    return "failed" == this.actionState;
  },
  _computeMusicianModeDisabled: function() {
    return false;
    /*
    if (!this.registrationStatus) return true;
    return 'Registered' != this.registrationStatus.status
      && 'Verified' != this.registrationStatus.status;
    */
  },
  _computeActionText: function() {
    if (!this.registrationStatus || !this.registrationStatus.action) return "";
    return this.registrationStatus.action.button;
  },
  _computeUserMessage: function() {
    if (!this.registrationStatus || !this.registrationStatus.action) return "";
    return this.registrationStatus.action.message;
  },
  handleCallToAction: function() {
    var action = this.registrationStatus.action;
    if (action) {
      var handler = this.actionHandlers[action.type] || this.errorHandler;
      handler(action);
    }
  },
  updateMusicianMode: function() {
    mscIntf.profile.setMusicianMode(this.$.musicianModeButton.checked);
  },
  handleSendAction: function(action){
    var wei = action.weiToSend;
    var recipient = action.recipient;
    if (wei && recipient) {
      this.actionState = "pending";
      mscIntf.payments.sendWei(recipient, wei)
        .bind(this)
        .then(function(){
          this.actionState = "";
          console.log("Confirmation payment success!");
        })
        .catch(function(err) {
          this.actionState = "failed";
          console.log("Failed to send confirmation payment: " + err);
        });
    }
    else {
      this.actionState = "failed";
      console.log("Could not send confirmation payment based on action: " + JSON.stringify(action));
    }
  },
  handleExternalLinkAction: function(action) {
    gui.Window.open(action.url, {
      width: 1024,
      height: 768
    });
  },
  handleAppLinkAction: function(action) {
    // TODO: define a mapping between server pageIds and internal pageIds
    if (action.url == "MyWorks") mscIntf.selectedPage = 'myw';
  },
  toggleMiningState: function() {
    if (this.$.isMining.checked) {
      mscIntf.payments.startMining();
    }
    else {
      mscIntf.payments.stopMining();
    }
  },
  _computeSelectedAccount: function() {
    return this.selectedAccount || "";
  }
});
