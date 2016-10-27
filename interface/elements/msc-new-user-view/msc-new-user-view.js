Polymer({
    is: 'msc-new-user-view',
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
        reflectToAttribute: true,
      },

    },
    _page_change: function(ev) {
      console.log('!!');
      this.opened=ev.detail=='nwu'?true:false;
    },
});
