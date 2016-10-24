Polymer({
    is: 'app-user-settings-view',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
    },
    attached:function(){

    },
    properties: {
      locale: Object,
      opened: {
        type:Boolean,
        value:false,
        reflectToAttribute:true,
      },
    },
    open: function() {
      this.opened = true;
    }
});
