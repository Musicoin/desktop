Polymer({
    is: 'app-account-selector',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
    },
    attached:function(){

    },
    properties: {
      locale: {
        type:Object,
        observer: 'localeChange'
      },
      /* test data */
      availableAccounts:{
        type:Object,
        value:[
          '8f513dcef75dcf965498eb26359c915be644f29e',
          'd1c371364452887bd3de0689ed1644297b0cb0b9',
          'd4c44b78cd531bbb59b9b91eeb9e0a39c1d208e8',
          'b8011cd5359080e8e0a67df0159e9e3801a1471e',
          '733fc6661ffc22faf3edb5ffcdbecfc13ec5ccb9' ],
      },
      selectorRole: {
        type: String,
        value: 'coinbase',
      },
      roleAssigned: String,
      accountChosen: {
        type: Boolean,
        value: false,
      },
      selectedAccount: {
        type: String,
        value: '733fc6661ffc22faf3edb5ffcdbecfc13ec5ccb9',
      }
    },
    localeChange: function(newValue) {
      newValue && (this.roleAssigned = this.locale.accountSelector.roles[this.selectorRole])
    },
    toggleList: function(ev) {
      this.$.collapseList.toggle();
    }
});
