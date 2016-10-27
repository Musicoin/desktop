var request = require("request");
Polymer({
  is: 'msc-metadata-editor',
  properties: {
    metadata: {
      type: Array,
    },
    metadataUrl: {
      type: String,
      reflectToAttribute: true,
      observer: "_metadataUrlChanged"
    },
    editable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    }
  },
  ready: function () {
    //console.log("Metadata editable: " + this.editable);
  },

  getMetadata: function() {
    return this.metadata;
  },

  _metadataUrlChanged: function(newUrl) {
    if (!newUrl) {
      this.metadata = [];
      return;
    }

    this.metadata = [{key: "Loading...", value:newUrl}];
    request({
      url: newUrl,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        this.metadata = body;
      }
      else {
        console.log("Unable to load metadata: " + error);
        this.metadata = [];
      }
    }.bind(this));
  },

  _shouldHideHeaderRow: function (e) {
    return !this.metadata || this.metadata.length == 0;
  },

  _shouldHideInstructions: function() {
    return !this.editable || this.metadata.length > 0;
  },

  addMetadataRow: function() {
    this.push('metadata', {key: '', value: ''});
  },

  addMetadata: function(_key, _value) {
    this.push('metadata', {key: _key, value: _value});
  },

  addMetadataIfLast: function(e) {
    if (e.model.index == this.metadata.length - 1 && (e.model.keyValue.key || e.model.keyValue.value)) {
      this.addMetadataRow();
    }
  },

  removeExtendedMetadataRow: function(e) {
    this.splice('metadata', e.model.index, 1);
    this.notifyPath('metadata');
  }
});
