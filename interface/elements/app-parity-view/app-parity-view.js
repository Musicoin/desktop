Polymer({
    is: 'app-parity-view',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.financialData.parityData = {register:this,prop:'parityData'}
    },
    attached:function(){

    },
    properties: {
      locale:Object,
      parityData:Object,
      newAccountId: {
        type: String,
        value: ''
      }
    },
})
