Polymer({
    is: 'app-payment-approval-dialog',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'};
      mscIntf.financialData.amountToPay = {register:this,prop:'amountToPay'};
    },
    attached:function(){

    },
    properties: {
      locale: Object,
      amountToPay: Number,
    },

    behaviors: [
      Polymer.PaperDialogBehavior,
      Polymer.NeonAnimationRunnerBehavior
    ],

    listeners: {
      'neon-animation-finish': '_onNeonAnimationFinish'
    },

    _renderOpened: function() {
      this.cancelAnimation();
      this.playAnimation('entry');
    },

    _renderClosed: function() {
      this.cancelAnimation();
      this.playAnimation('exit');
    },

    _onNeonAnimationFinish: function() {
      if (this.opened) {
        this._finishRenderOpened();
      } else {
        this._finishRenderClosed();
      }
    }
})
