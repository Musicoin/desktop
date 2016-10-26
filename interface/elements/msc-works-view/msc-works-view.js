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
      if (this.worksDataIsDirty) {
        console.log("Forcing MyWorks to refresh because it's dirty!");
        mscIntf.catalog.loadMyWorks();
      }
      mscIntf.selectedWork = null;
    }.bind(this));

    this.$.workEditor.addEventListener('release-work', function (e) {
      this.releaseWork(e.detail);
    }.bind(this));

    // this event bubbles up from all child license editors.
    this.$.workEditor.addEventListener('release-license', function (e) {
      this.releaseLicense(e.detail);
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
      licenses: []
    }
  },

  releaseWork: function (releaseEvent) {
    // TODO: Still working on backend for this
  },

  releaseLicense: function (releaseEvent) {
    // TODO: Still working on backend for this
  },
})
