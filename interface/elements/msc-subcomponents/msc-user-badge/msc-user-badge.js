Polymer({
    is: 'msc-user-badge',
    ready:function(){
      mscIntf.userDetails = {register:this,prop:'userDetails'};
      mscIntf.toolSettings.userImagePath = {register:this,prop:'usersImageDir'};
    },
    properties: {
      userDetails: Object,
      usersImageDir: String,
    },
    menuPick: function(ev) {
      if (ev.target.selected=='loo') mscIntf.fnPool('login','logoutUser');
      if (ev.target.selected=='acc') document.querySelector('msc-account-create-confirm-dialog').open()
      if (ev.target.selected=='set') document.querySelector('msc-user-settings-view').open()
      ev.target.selected = null;
    },
})
