Polymer({
    is: 'app-player-view',
    ready: function() {
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.contractGroups = {register:this,prop:'contractGroups'}
      mscIntf.toolSettings.contractImagesPath = {register:this,prop:'contractImagesPath'};
    },
    properties:{
      locale: Object,
      contractGroups: Array,
      contractImagesPath: String,
      status: '' //?????
    },
    playProvidedContract : function(e) {
      //getMusicoin().playSelection(e.model.item);
    },
    playAll: function() {
      //var all = [];
      //for (var g in this.contractGroups) {
      //     var group = this.contractGroups[g];
      //     all = all.concat(group.contracts);
      // }
      // getMusicoin().playAll(all);
    },
    stopPlaying: function () {

    },
    addCustomContract: function () {

    },
    // setDataModel: function(dataModel) {
    //    this.set('contractGroups', dataModel);
    // }
})
