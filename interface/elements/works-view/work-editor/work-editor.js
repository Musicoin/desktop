Polymer({
  is: 'work-editor',
  properties: {
    work: {
      type: Object,
      reflectToAttribute: true
    },
    editable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },
    locale: String
  },
  ready: function () {
    mscIntf.attach(this)
      .to('locale');

    this.releaseButtonText = "Release";
    this.$.fileSelector.onclick = function() {
      if (this._isWorkEditable()) {
        this.$.imageFile.click();
      }
    }.bind(this);

    this.$.imageFile.onchange = function() {
      if (!this._isWorkEditable()) return;
      var filePath = this.$.imageFile.value;
      if (filePath) {
        var corrected = "file:///" + filePath.split("\\").join("/");
        console.log("img path: " + filePath);
        console.log("img src: " + corrected);

        this.set('work.image_url_https', corrected);
        this.set('work.imgFile', filePath);
      }
    }.bind(this);
  },

  _shouldHideInstructions: function() {
    return this.work && this.work.licenses && this.work.licenses.length > 0;
  },

  _isWorkEditable: function() {
    if (!this.work) return false;
    return !this.work.contract_address;
  },

  releaseWork: function() {
    this.fire('release-work', {
      editor: this,
      work: this.getDataObject()});
  },

  handleBackClick: function () {
    this.fire('back-clicked');
  },

  handleAddLicense: function (input) {
    this.push('work.licenses', this.createNewLicense());
  },

  onReleasePending: function() {
    this.status = "Pending...";
    this.releasePending = true;
  },

  onReleaseSuccess: function(address) {
    this.status = "Success!";
    this.releasePending = false;
    this.set("work.address", address);
    this.editable = false;
  },

  onReleaseFailure: function(err) {
    this.releasePending = false;
    this.status = "Failed!";
    console.log("Filed to release work: " + err);
  },

  createNewLicense: function() {
    return {
      type: 0,
      typeName: "PPP",
      coinsPerPlay: 1,
      address: "",
      editable: true,
      releaseState: 0,
      contributors: [],
      royalties: [],
      metadata: []
    }
  }
});