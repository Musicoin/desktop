Polymer({
    is: 'app-user-badge',
    properties: {
      badgeImage: {
        type: String,
        value: mscIntf.userDetails.image
      },
      badgeUsername: {
        type: String,
        value: mscIntf.userDetails.name
      },
      badgeDir: {
        type: String,
        value: mscIntf.toolSettings.userImagePath
      },
    },

})
