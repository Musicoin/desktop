Polymer({
    is: 'app-login-view',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.loginLock = {register:this,prop:'loginLock'}
      mscIntf.listUsers = {register:this,prop:'listUsers'}
      mscIntf.toolSettings.userImagePath = {register:this,prop:'usersImageDir'};
    },
    properties: {
      loginLock: {
        type: Boolean,
        reflectToAttribute:true,
      },
      listUsers:{
        type:Object,
        value:[],
      },
      usersImageDir: String,
      locale: Object,
    },
    noPassEnter: function(ev) {
      result = mscIntf.fnPool('login','verifyLogin',null,{login:this.$.list.selectedItem.userLogin});
      if (result.error) {
        //show error here
      }
    },
    passEnter: function(login,txtBox) {
      txtBox.tagName=='INPUT' && (txtBox=txtBox.parentNode.parentNode.parentNode.parentNode);
      if (txtBox.value!='') {
        var result = mscIntf.fnPool('login','verifyLogin',null,{login:login, pwd:txtBox.value});
        txtBox.value = '';
        if (result.error) {
          txtBox.blur();
          txtBox.classList.remove("shakeit");
          void txtBox.offsetWidth;
          txtBox.classList.add("shakeit");
        }
      }
    },
    catchEnter: function (ev) {
      if (ev.keyCode === 13) {
        this.passEnter(this.$.list.selectedItem.userLogin,ev.target);
      }
    },
    onBlur: function(ev) {
      this.passEnter(this.$.list.selectedItem.userLogin,ev.target);
    },
})
