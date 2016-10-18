Polymer({
    is: 'app-connection-watch',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.chainReady = {register:this,prop:'chainReady'}
      mscIntf.chainSync = {register:this,prop:'chainSync'}
      mscIntf.ipfsReady = {register:this,prop:'ipfsReady'}
      mscIntf.serverReady = {register:this,prop:'serverReady'}
    },
    attached:function(){

    },
    properties: {
      locale:Object,
      chainReady: {
        type: Boolean,
        observer: 'computeNotifierChain'
      },
      chainSync: {
        type: Object,
        observer: 'computeNotifierSyncChain'
      },
      ipfsReady: {
        type: Boolean,
        observer: 'computeNotifierIpfs',
      },
      serverReady: {
        type: Boolean,
        observer: 'computeNotifierServer'
      },
      chain:String,
      ipfs:String,
      server:String
    },
    computeNotifierChain: function() {
      this.chain = this.chainReady?this.locale.connectionWatch.chainReady:this.locale.connectionWatch.chainNotReady;
    },
    computeNotifierSyncChain: function() {
      console.log('sync',this.chainSync);
      //this.chain = this.chainReady?this.locale.connectionWatch.chainReady:this.locale.connectionWatch.chainNotReady;
    },
    computeNotifierIpfs: function() {
      this.ipfs = this.ipfsReady?this.locale.connectionWatch.ipfsReady:this.locale.connectionWatch.ipfsNotReady;
    },
    computeNotifierServer: function() {
      this.server = this.serverReady?this.locale.connectionWatch.serverReady:this.locale.connectionWatch.serverNotReady;
    },
})
