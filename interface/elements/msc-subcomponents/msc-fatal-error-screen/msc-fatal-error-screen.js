Polymer({
    is: 'msc-fatal-error-screen',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
    },
    attached:function(){

    },
    properties: {
      locale: Object,
      shown: false,
    },
    _ws_stateChange: function(ev) {
      console.log('WS',ev.detail);
    },

});
