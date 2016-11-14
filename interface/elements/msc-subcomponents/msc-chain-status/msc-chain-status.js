Polymer({
    is: 'msc-chain-status',
    properties: {
        syncStatus: Object,
        ipfsStatus: Object
    },
    ready: function() {
        mscIntf.attach(this)
          .to('syncStatus')
          .to('ipfsStatus');
    },
    _computeIsSyncing: function() {
        return this.syncStatus && this.syncStatus.syncing;
    },
    _computePeerIcon: function() {
      if (!this.syncStatus || this.syncStatus.peers == 0) return "social:person-outline";
      if (this.syncStatus.peers == 1) return "social:person";
      return "social:people";
    },
    _formatBlockNumber: function() {
        if (!this.syncStatus || !this.syncStatus.currentBlock) return "0";
        return this.syncStatus.currentBlock.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    _computeIPFSIcon: function() {
        if (!this.ipfsStatus || !this.ipfsStatus.connected) return "icons:cloud-off";
        return "icons:cloud-done";
    },
    _computeIPFSTooltip: function() {
        if (!this.ipfsStatus || !this.ipfsStatus.connected) return "IPFS not connected";
        return "IPFS connected";
    }
});
