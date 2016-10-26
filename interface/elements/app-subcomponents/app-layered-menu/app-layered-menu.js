Polymer({
    is: 'app-layered-menu',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.userDetails = {register:this,prop:'userDetails'};
      mscIntf.toolSettings.userImagePath = {register:this,prop:'usersImageDir'};
      mscIntf.attach(this)
        .to('browseCategories');
    },
    attached:function(){

    },
    properties: {
      locale: Object,
      baseWidth:{
        type:Number,
        value:45,
        observer:'_baseWidthChange',
      },
      extendedWidth:{
        type:Number,
        value:256,
        observer:'_extendedWidthChange',
      },
      opened: {
        type:Boolean,
        value:true,
        observer:'_openSub',
        reflectToAttribute:true,
      },
      userDetails: Object,
      usersImageDir: String,
      topSelected: {
        type:String,
        reflectToAttribute:true,
        value:'usr',
      },
      bottomSelected: {
        type:String,
        reflectToAttribute:true,
        value:'usr',
      },
      topNotifiesTopElement: {
        type:Object,
        value:{elem:'#app',attr:'selected-page'},
      },
      bottomNotifiesTopElement: {
        type:Object,
        value:{elem:'#app',attr:'selected-page'},
      },
      browseCategories: Array,
    },
    _baseWidthChange: function(newValue) {

    },
    _extendedWidthChange: function(newValue) {

    },
    _openSub: function(newValue) {

    },
    topMenuSelect: function(ev) {
      !this.opened && (this.opened = true);
      this.topSelected = ev.target.selected;
      this.topNotifiesTopElement.elem && document.querySelector(this.topNotifiesTopElement.elem).setAttribute(this.topNotifiesTopElement.attr,ev.target.selected);
      Polymer.dom(this.root).querySelectorAll('.sub-menu-box').forEach((item)=>{item.classList.remove('active')});
      this.$$('[sub-menu-box-id='+ev.target.selected+']').classList.add('active');
    },
    bottomMenuSelect: function(ev) {
      this.bottomSelected = ev.target.selected;
      this.opened = false;
      this.bottomNotifiesTopElement.elem && document.querySelector(this.bottomNotifiesTopElement.elem).setAttribute(this.bottomNotifiesTopElement.attr,ev.target.selected);
      if (ev.target.selected=='loo') mscIntf.fnPool('login','logoutUser');
      if (ev.target.selected=='acc') document.querySelector('app-account-create-confirm-dialog').open()
      if (ev.target.selected=='set') document.querySelector('app-user-settings-view').open()
    },

});
