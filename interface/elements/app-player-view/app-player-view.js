Polymer({
    is: 'app-player-view',
    ready: function() {
        this.contractGroups = [];
    },
    playProvidedContract : function(e) {
      getMusicoin().playSelection(e.model.item);
    },
    playAll: function() {
      var all = [];
      for (var g in this.contractGroups) {
          var group = this.contractGroups[g];
          all = all.concat(group.contracts);
      }
      getMusicoin().playAll(all);
    },
    setDataModel: function(dataModel) {
        this.set('contractGroups', dataModel);
    }
})
