Polymer({
    is: 'msc-simple-user-badge',
    ready:function(){
      mscIntf.userDetails = {register:this,prop:'userDetails'};
      mscIntf.toolSettings.userImagePath = {register:this,prop:'usersImageDir'};
      mscIntf.userPreferences.attach(this)
        .to('musicianMode')
        .to('username')
    },
    attached: function() {
      mscIntf.financialData.attach(this)
        .to('selectedAccount');
    },
    properties: {
      userDetails: Object,
      usersImageDir: String,
      selectedAccount: String
    },
    menuPick: function(ev) {
      if (ev.target.selected=='loo') mscIntf.fnPool('login','logoutUser');
      if (ev.target.selected=='acc') document.querySelector('app-account-create-confirm-dialog').open()
      if (ev.target.selected=='set') document.querySelector('app-user-settings-view').open()
      ev.target.selected = null;
    },
    showProfile: function() {
      mscIntf.selectedPage = 'myp';
    }
})
