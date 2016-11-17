// var ipfsUtil = require('../ipfs-connector.js');
Polymer({
  is: 'msc-works-view',
  properties: {
    myWorks: Array,
    selectedWork: Object,
    locale: Object
  },
  ready: function () {
    mscIntf.attach(this)
      .to('locale')
      .to('selectedWork')
      .to('myWorks')

    this.$.workEditor.addEventListener('back-clicked', function (e) {
      mscIntf.catalog.loadMyWorks(); // force refresh
      mscIntf.selectedWork = null;
    }.bind(this));
  },

  shouldShowGridView: function () {
    return this.selectedWork == null;
  },

  handleAddNewWork: function () {
    // create a new work, but don't add it to the "works" page until it's been released
    mscIntf.selectedWork = this.createNewWork();
  },

  createNewWork: function () {
    return {
      title: "",
      img: "",
      metadata: [],
      metadata_url_https: "",
      workType: 2,
      license: {
        type: 0,
        typeName: "PPP",
        coinsPerPlay: 1,
        address: "",
        editable: true,
        releaseState: 0,
        contributors: [{
          name: 'You',
          address: mscIntf.financialData.selectedAccount,
          shares: 1
        }],
        royalties: [],
        metadata: [],
        metadata_url_https: ""
      },
      releaseState: 0
    }
  },
})
