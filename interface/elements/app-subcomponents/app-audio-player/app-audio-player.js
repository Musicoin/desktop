Polymer({
    is: 'app-audio-player',
    ready:function(){
      mscIntf.audioElement = this.$.player;
      mscIntf.currentPlay = {register:this,prop:'currentPlay'};
      this.$.player.addEventListener('playing', this.updatePlayState);
      this.$.player.addEventListener('play', this.updatePlayState);
      this.$.player.addEventListener('pause', this.updatePlayState);
      this.$.player.addEventListener('abort', this.updatePlayState);
    },
    attached:function(){

    },
    properties: {
      currentPlay:Object,
      playState: {
        type: String,
        value: 'av:pause'
      }
    },
    updatePlayState: function() {
      //this.playState = this.$.player.paused ? 'av:play-arrow' : 'av:pause';
    },
    togglePlayState: function(ev) {
      this.playState = this.$.player.paused ? 'av:play-arrow' : 'av:pause';
      console.log(mscIntf.fnPool('audio', 'togglePlayState', this, {param:1}));
    },
    skipTrack: function(ev) {
      console.log(mscIntf.fnPool('audio', 'skipTrack', this, {param:1}));
    },
    sendTip: function(ev) {
      console.log(mscIntf.fnPool('finops', 'sendTip', this, {param:1}));
    },
})
