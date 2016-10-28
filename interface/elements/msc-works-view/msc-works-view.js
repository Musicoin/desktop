// var ipfsUtil = require('../ipfs-connector.js');
Polymer({
  is: 'msc-works-view',
  properties: {
    myWorks: Array,
    selectedWork: Object
  },
  ready: function () {
    mscIntf.attach(this)
      .to('selectedWork')
      .to('myWorks', function (oldValue, newValue) {
        this.myWorks = [{
          name: "", items: newValue.map(function (work) {
            return {
              line1: work.title,
              line2: work.artist,
              img: work.image_url_https,
              data: work
            }
          })
        }];
      }.bind(this))


    // this.ipfsUtils = new IPFSConnector();
    this.$.gridView.addEventListener('selected', function (e) {
      mscIntf.selectedWork = e.detail[0];
    }.bind(this));

    this.$.workEditor.addEventListener('selected', function (e) {
      this.showLicenseDetail(e.detail);
    }.bind(this));

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
      licenses: [],
      releaseState: 0
    }
  },
})
