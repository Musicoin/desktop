Polymer({
    is: 'app-user-balance',
    ready:function(){
      mscIntf.financialData.userBalance = {register:this,prop:'userBalance'};
      mscIntf.financialData.pendingPayments = {register:this,prop:'pendingPayments'};
    },
    properties: {
      userBalance: Number,
      pendingPayments: Number
    },
    onOpenTxDetails: function(ev) {
      
    }
})
