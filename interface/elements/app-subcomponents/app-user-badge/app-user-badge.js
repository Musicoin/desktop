Polymer({
    is: 'app-user-badge',
    ready:function(){
      mscIntf.userDetails = {register:this,prop:'userDetails'};
      mscIntf.toolSettings.userImagePath = {register:this,prop:'userImageDir'};
    },
    properties: {
      userDetails: Object,
      userImageDir: String,
    },

})
