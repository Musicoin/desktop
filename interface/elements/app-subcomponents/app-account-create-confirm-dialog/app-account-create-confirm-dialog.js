Polymer({
    is: 'app-account-create-confirm-dialog',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.notifyAccCreateDialog = {register:this,prop:'notifyThisDialog'}
    },
    attached:function(){

    },
    properties: {
      locale: Object,
      notifyThisDialog: {
        type:Boolean,
        observer:'notification'
      },
      errorOccured: {
        type:Boolean,
        value:false,
        reflectToAttribute:true,
      },
      waitForConfirmation: {
        type:Boolean,
        value:false,
        reflectToAttribute:true,
      },
      messageSwitch: {
        type:Boolean,
        value:false,
        reflectToAttribute:true,
      },
    },
    behaviors: [
      Polymer.PaperDialogBehavior,
    ],
    listeners: {
      'iron-overlay-canceled':'_backdropCancel',
      'iron-overlay-opened':'_showDialog',
      'iron-overlay-closed':'_hideDialog',
    },
    notification:function(newValue) {
      if (newValue!==null) {
        mscIntf.notifyAccCreateDialog = null;
        this.messageSwitch = true;
        this.notifyResize();
        // could be done with arrow fn, but if we reuse interface as www it does not work everywhere
        newValue===true?setTimeout((function () {this._clearStates();this.close()}).bind(this),900):(this.errorOccured = true);
      }
    },
    _backdropCancel:function(ev) {
      !this.errorOccured && ev.preventDefault();
    },
    _clearStates:function() {
      this.errorOccured = false;
      this.waitForConfirmation = false;
      this.messageSwitch = false;
    },
    _showDialog:function(ev) {
      this._clearStates();
    },
    _hideDialog:function(ev) {
      this._clearStates();
    },
    passEnter: function(txtBox) {
      txtBox.tagName=='INPUT' && (txtBox=txtBox.parentNode.parentNode.parentNode.parentNode);
      if (txtBox.value!='') {
        var result = mscIntf.fnPool('chain','createPrivateAccount',null,{pwd:txtBox.value});
        txtBox.value = '';
        if (result.error) {
          this.errorOccured = true;
          this.notifyResize();
        } else if (result.result = 'pending') {
          this.waitForConfirmation = true;
          this.notifyResize();
        }
      }
    },
    catchEnter: function (ev) {
      if (ev.keyCode === 13) {
        this.passEnter(ev.target);
      }
    },
    onBlur: function(ev) {
      this.passEnter(ev.target);
    },

})
