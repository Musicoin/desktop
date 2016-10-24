Polymer({
    is: 'app-fancy-background',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
    },
    attached:function(){

    },
    properties: {
      locale: Object,
    },
    behaviors: [
      Polymer.IronResizableBehavior
    ],
    listeners: {
        'iron-resize': "_resizeHandler"
    },
    _resizeHandler: function(ev) {
      var w = this.w = Math.floor(this.parentElement.offsetWidth);
      var h = this.h = Math.floor(this.parentElement.offsetHeight);
      console.log('resized',w,h);
      this.style.backgroundImage = 'url('+mscIntf.drawFancyFractals(this.$.bkg,{w:this.w,h:this.h,bkg:'#fff'})+')';
    },
});
