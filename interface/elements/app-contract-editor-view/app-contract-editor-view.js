Polymer({
    is: 'app-contract-editor-view',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
    },
    attached:function(){

    },
    properties: {
      locale: Object,
    },
})
