Polymer({
    is: 'msc-user-balance',
    ready:function(){
      mscIntf.financialData.pendingPayments = {register:this,prop:'pendingPayments'};
      mscIntf.financialData.attach(this)
        .to('userBalance', function(oldValue, newValue) {
          this.userBalance = newValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }.bind(this));
    },
    properties: {
      userBalance: Number,
      pendingPayments: Number
    },
    onOpenTxDetails: function(ev) {
      
    }
})
