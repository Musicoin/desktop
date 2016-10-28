Polymer({
  is: 'msc-work-editor',
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

  _computeIsPending: function() {
    if (!this.work) return false;

    if (this.work.contract_address) {
      return false;
    }
    return this.work.releaseState == 1;
  },

  _computeReleaseMessage: function() {
    if (!this.work) return "";

    if (this.work.contract_address) {
      return "";
    }
    var values = ["Unreleased", "Pending...", "Failed!"];
    return values[this.work.releaseState];
  },

  _shouldHideInstructions: function() {
    return this.work && this.work.licenses && this.work.licenses.length > 0;
  },

  _isWorkEditable: function() {
    if (!this.work) return false;
    return !this.work.contract_address;
  },

  releaseWork: function() {
    this.work.metadata = this.$.metadataEditor.getMetadata();
    var err = this.checkForErrors(this.work)
    if (err) {
      alert(err);
      return;
    }

    this.set("work.releaseState", 1);
    mscIntf.catalog.releaseWork(this.work)
      .bind(this)
      .then(function(result) {
        this.set("work.contract_address", result);
        this.set("work.releaseState", 3);
      })
      .catch(function(err) {
        this.set("work.releaseState", 2);
        console.log(err);
      });
  },

  checkForErrors: function(w) {
    if (!w.title) return this.locale.workEditor.validation.title;
    if (!w.imgFile) return this.locale.workEditor.validation.image;
    if (!w.artist) return this.locale.workEditor.validation.artist;
    return null;
  },

  handleBackClick: function () {
    this.fire('back-clicked');
  },

  handleAddLicense: function (input) {
    this.push('work.licenses', this.createNewLicense());
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
      metadata: [],
      metadata_url_https: ""
    }
  }
});