Polymer({
  is: 'app-player-view',
  ready: function() {
    mscIntf.locale = {register:this,prop:'locale'}
    // mscIntf.groups = {register:this,prop:'groups'}
    mscIntf.toolSettings.contractImagesPath = {register:this,prop:'contractImagesPath'};
  },
  properties: {
    locale: Object,
    contractImagesPath: String,
    showGroupPlayIcon: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },
    groups: {
      type: Array,
      value: [],
      reflectToAttribute: true
    },
    instructionText: {
      type: String,
      value: "",
      reflectToAttribute: true
    },
    groupActionIcon: {
      type: String,
      value: "av:play-arrow",
      reflectToAttribute: true
    }
  },
  _shouldHideInstructions: function() {
    for (var g in this.groups) {
      if (this.groups[g] && this.groups[g].items && this.groups[g].items.length > 0)
        return true;
    }
    return false;
  },
  handleItemSelection : function(e) {
    this.notifySelectionChanged([e.model.item]);
  },
  handleGroupSelection: function(e) {
    this.notifySelectionChanged(e.model.group.items.slice());
  },
  notifySelectionChanged: function(viewItems) {
    // each view item should have a 'data' element that will be used for the callback
    this.fire('selected', viewItems.map(function(viewItem){
      return viewItem.data;
    }));
  }
})
