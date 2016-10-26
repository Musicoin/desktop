Polymer({
    is: 'app-works-view',
    ready:function(){
      mscIntf.locale = {register:this,prop:'locale'}
      mscIntf.toolSettings.uploadedImagesDir = {register:this,prop:'uploadedImagesDir'};
      mscIntf.toolSettings.ipfsTestData = {register:this,prop:'ipfsTestData'};
      mscIntf.worksEditor.contributors = {register:this,prop:'contributors'};
    },
    attached:function(){

    },
    properties: {
      locale: Object,
      uploadedImagesDir: String,
      selectedImage: {
        type:String,
        value:'dylan.jpg'
      },
      selectedAudio: String,
      ipfsTestData: Object,
      contributors: Object,
    },
    removeContributor: function() {

    },
    checkForEnter: function() {

    },
    deploy: function() {

    },
    test: function() {

    },
    testEncryption: function() {

    },
    testDecryption: function() {

    },
})
