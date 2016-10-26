Polymer({
  is: 'metadata-editor',
  properties: {
    metadata: {
      type: Object,
      reflectToAttribute: true
    },
    editable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    }
  },
  ready: function () {
    console.log("Metadata editable: " + this.editable);
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