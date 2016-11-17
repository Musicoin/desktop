Polymer({
  is: 'msc-simple-work-editor',
  properties: {
    work: {
      type: Object,
      reflectToAttribute: true,
      observer: "_workChanged"
    },
    editable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },
    locale: String,
    hideAdvancedSection: {
      type: Boolean,
      value: true
    }
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

    this.$.audioFileSelector.onclick = function() {
      if (this._isWorkEditable()) {
        this.$.audioFile.click();
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

    this.$.audioFile.onchange = function() {
      if (!this.work.license.editable) return;
      var filePath = this.$.audioFile.value;
      if (filePath) {
        this.set('selectedAudio', filePath);
        var stats = fs.statSync(filePath);
        var fileSizeInBytes = stats["size"];
        var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
        this.$.metadataEditor.addMetadata("fileName", path.basename(filePath));
        this.set('selectedAudioText', path.basename(filePath));
        this.set('selectedAudioSize', fileSizeInMegabytes.toFixed(1) + " mb");
        this.set('work.license.audioFile', filePath);
      }
    }.bind(this);

    this.selectedAudioText = "Select audio file";
  },

  _workChanged: function() {
    this.hideAdvancedSection = true;
    if (this.work && this.work.license && this.work.license.contract_id) {
      if (this.work.license.resource_url) {
        this.selectedAudioText = this.work.license.resource_url;
      }
    }
    else {
      this.selectedAudioText = "Select audio file";
      this.selectedAudioSize = "";
      this.advancedOptionLabel = this.locale.workEditor.actions.showAdvanced;
    }
  },

  _computeAdvancedToggleButtonText: function() {
    return this.hideAdvancedSection
      ? this.locale.workEditor.actions.showAdvanced
      : this.locale.workEditor.actions.hideAdvanced;
  },

  toggleAdvancedSection: function() {
    this.hideAdvancedSection = !this.hideAdvancedSection;
  },

  _computeIsPending: function() {
    if (!this.work) return false;
    return this.work.releaseState == 1;
  },

  _computeReleaseMessage: function() {
    if (!this.work) return "";

    if (this.work.contract_address) {
      return "";
    }
    var values = ["", "Pending...", "Failed!"];
    return values[this.work.releaseState];
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
    var result = {};
    this.work.isPending = true;
    mscIntf.catalog.releaseWork(this.work)
      .bind(this)
      .then(function(workAddress) {
        result.workAddress = workAddress;
        this.work.license.workAddress = workAddress; // require for PPP contract creation
        this.work.license.artist = this.work.artist;
        this.work.license.title = this.work.title;
        return mscIntf.catalog.releaseLicense(this.work.license);
      })
      .then(function(licenseAddress) {
        this.set("work.releaseState", 3);
        this.set("work.license.workAddress", result.workAddress);
        this.set("work.contract_address", result.workAddress);
        this.set("work.license.contract_id", licenseAddress);
        this.set("work.license.editable", false);
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
    if (!w.license.audioFile) return this.locale.workEditor.validation.audio;
    return null;
  },

  handleBackClick: function () {
    this.fire('back-clicked');
  },

  _licenseChanged: function() {
    if (!this.work.license) return;

    this.set("work.license.coinsPerPlay", mscIntf.clientUtils.convertToMusicoinUnits(this.work.license.wei_per_play));
    if (!this.work.license.type) {
      this.set("work.license.type", 0);
      this.set("work.license.typeName", "PPP");
    }
  },

  _computeRemainingCoinsPerPlay: function(coinsPerPlay, change) {
    return coinsPerPlay - this.sumOfRoyalties(this.work.license.royalties);
  },

  _computeLicenseHeaderText: function() {
    if (this.work.license.contract_id) return this.work.license.contract_id;
    var values = ["Unreleased", "Pending...", "Failed!"];
    return values[this.work.license.releaseState];
  },

  _shouldHideShareholderMessage: function(e) {
    return this.work.license.contributors.length == 0 || this.sumOfRoyalties(this.work.license.royalties) == 0;
  },

  _shouldHideRoyaltyInstructions: function(e) {
    return this.work.license.contributors.length > 0 || this.work.license.royalties.length > 0;
  },

  _isPending: function() {
    return this.work.license.releaseState == 1;
  },
  _shouldHideCancelButton: function() {
    if (!this.work) return false;
    return this.work.releaseState != 0;
  },

  sumOfRoyalties: function(royalties) {
    var total = 0;
    royalties.forEach(function (r) {
      total += parseFloat(r.amount);
    })
    return total;
  },

  updateUserMapping: function (e) {
    // var item = e.model.royalty ? e.model.royalty : e.model.contributor;
    // if (item)
    //   this.addressToNameMapping[item.address] = item.name;
  },

  addContributorOnEnter: function (e) {
    if (!this.work.license.editable) return;
    var that = this;
    this.processAndClearOnEnter(e, function(value) {
      that.addContributor(value);
    });
  },

  addRoyaltyOnEnter: function (e) {
    if (!this.work.license.editable) return;
    var that = this;
    this.processAndClearOnEnter(e, function(value) {
      that.addRoyalty(value);
    });
  },

  addNewRoyalty : function() {
    if (!this.work.license.editable) return;
    this.push('work.license.royalties', {
      name: '',
      address: '',
      amount: 0
    });
  },

  addNewContributor : function() {
    if (!this.work.license.editable) return;
    this.push('work.license.contributors', {
      name: '',
      address: '',
      shares: 1
    });
  },

  processAndClearOnEnter: function(e, callback) {
    if (e.keyCode === 13) {
      var name = e.currentTarget.value;
      e.currentTarget.value = '';
      callback(name);
    }
  },

  addContributor: function(input) {
    if (!this.work.license.editable) return;
    var contributor = this.isAddress(input)
      ? this.lookupContributorByAddress(input)
      : this.lookupContributorByName(input); // just testing delete function
    if (contributor) {
      this.push('work.license.contributors', {
        name: contributor.name,
        address: contributor.address,
        shares: 1
      });
    }
  },

  addRoyalty: function(input) {
    if (!this.work.license.editable) return;
    var contributor = this.isAddress(input)
      ? this.lookupContributorByAddress(input)
      : this.lookupContributorByName(input); // just testing delete function
    if (contributor) {
      this.push('work.license.royalties', {
        name: contributor.name,
        address: contributor.address,
        amount: 1
      });
    }
  },

  isAddress: function(value) {
    return value.startsWith("0x");
  },

  lookupContributorByName: function (name) {
    var found;
    for (var addr in this.addressToNameMapping) {
      if (this.addressToNameMapping[addr] == name) {
        found = addr;
      }
    }
    if (found) {
      return {
        name: name,
        address: found
      };
    }
  },

  lookupContributorByAddress: function (addr) {
    var found = this.addressToNameMapping[addr] || "(name)";
    return {
      name: found,
      address: addr
    }; // testing
  },

  removeContributor: function (e) {
    if (!this.work.license.editable) return;
    this.splice('work.license.contributors', e.model.index, 1);
  },

  removeRoyalty: function (e) {
    if (!this.work.license.editable) return;
    this.splice('work.license.royalties', e.model.index, 1);
  },
  openPreviewDialog: function() {
    var err = this.checkForErrors(this.work)
    if (err) {
      alert(err);
      return;
    }
    this.$.releaseButton.disabled = true;
    this.$.scrolling.open();
    window.setTimeout(function() {
      this.$.releaseButton.disabled = false;
    }.bind(this), 5000);
  }
});