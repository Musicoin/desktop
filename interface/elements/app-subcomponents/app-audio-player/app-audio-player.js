Polymer({
    is: 'app-audio-player',
    ready:function(){
      mscIntf.audioElement = this.$.player;
      mscIntf.currentPlay = {register:this,prop:'currentPlay'};
    },
    attached:function(){

    },
    properties: {
      currentPlay:Object
    },
    togglePlayState: function(ev) {
      console.log(mscIntf.fnPool('audio', 'togglePlayState', this, {param:1}));
    },
})
