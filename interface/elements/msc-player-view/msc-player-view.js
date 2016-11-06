Polymer({
  is: 'msc-player-view',
  ready: function() {
    mscIntf.locale = {register:this,prop:'locale'}
    // mscIntf.groups = {register:this,prop:'groups'}
    mscIntf.toolSettings.contractImagesPath = {register:this,prop:'contractImagesPath'};
  },
  properties: {
    locale: Object,
    contractImagesPath: String,
    groups: {
      type: Array,
      value: []
    },
    instructionText: {
      type: String,
      value: "",
      reflectToAttribute: true
    },
    selectedItem: {
      type: Object,
      value: {}
    },
    actions: {
      type: Array,
      value: []
    },
    groupActions: {
      type: Array,
      value: []
    },
    allowDrag: {
      type: Boolean,
      value: false
    }
  },
  _isSelected: function(item) {
    return this.selectedItem == item.id;
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
  },
  handleLine2Selection: function(e) {
    this.fire('line2-selected', e.model.item.data);
  },
  fireAction: function(e) {
    e.cancelBubble = true;
    e.stopPropagation();
    this.fire(e.model.action.id, e.model.dataHost.dataHost.dataHost.modelForElement(e.target).item.data);
  },
  fireGroupAction: function(e) {
    var items = e.model.dataHost.dataHost.dataHost.modelForElement(e.target).group.items;
    this.fire(e.model.action.id, items.map(function(viewItem){
      return viewItem.data;
    }));
  },
  handleTrack: function(e) {
    if (!this.allowDrag) return;
    var target = e.target;
    while (target && target.className.indexOf("title") < 0) {
      target = target.parentElement;
    }

    switch(e.detail.state) {
      case 'start':
        target.style.position = "relative";
        target.style.zIndex = 4;
        target.style.opacity = 0.8;
        this.startIndex = this.computePosition(target);
        this.dragItem = e.model.item;
        this.dragGroup = e.model.dataHost.dataHost.group;
        this.dragGroupIndex = e.model.dataHost.dataHost.index;
        break;
      case 'track':
        target.style.top = e.detail.dy + "px";
        target.style.left = e.detail.dx + "px";
        break;
      case 'end':
        var position = this.computePosition(target) + 1;
        target.style.top = 0 + "px";
        target.style.left = 0 + "px";
        target.style.opacity = 1;
        target.style.zIndex = 1;

        // Update the UI immediately, then fire the event
        var arrayId = "groups." + this.dragGroupIndex + ".items";
        var numItems = (target.parentElement.childElementCount-1);
        this.splice(arrayId, this.startIndex, 1);
        position = Math.min(position, numItems);
        if (position > this.startIndex) {
          this.splice(arrayId, position-1, 0, this.dragItem);
        }
        else {
          this.splice(arrayId, position, 0, this.dragItem);
        }

        this.fire("move", {group:this.dragGroup, item:this.dragItem, from:this.startIndex, to:position});
        break;
    }
  },
  computePosition: function(target) {
    var margin = 10;
    var yPos = target.getBoundingClientRect().top + target.getBoundingClientRect().height/2;
    var xPos = target.getBoundingClientRect().left;
    var numItems = (target.parentElement.childElementCount-1);
    var col = Math.floor((xPos - target.parentElement.getBoundingClientRect().left) / target.getBoundingClientRect().width);
    var cols = Math.floor((target.parentElement.getBoundingClientRect().width-10) / (target.getBoundingClientRect().width+margin));
    var row = Math.floor((yPos - target.parentElement.getBoundingClientRect().top) / target.getBoundingClientRect().height)
    var rows = Math.ceil(numItems/cols);

    var newCol = Math.max(-1, Math.min(cols, col));
    var newRow = Math.max(-1, Math.min(rows+1, row));
    var newPos = Math.max(-1, Math.min(numItems, newRow * cols + newCol));
    return newPos;
  }
});