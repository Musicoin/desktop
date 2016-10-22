Polymer({
    is: 'app-user-badge',
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
      if (ev.target.selected=='set') document.querySelector('app-account-create-confirm-dialog').open()
      ev.target.selected = null;
    },
    // listeners: {
    // 'tap': '_openSubMenu'
    // },
    // _openSubMenu: function(ev) {
    //   console.log('sub');
    // },

})
