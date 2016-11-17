Polymer({
  is: 'msc-work-detail-view',
  properties: {
    work: Object,
    expanded: {
      type: Boolean,
      value: false
    }
  },
  ready: function () {
    mscIntf.attach(this)
      .to('locale');
  },
  toggleDrawer: function () {
    this.expanded = !this.expanded;
  },
  _convertToMusicoin: function (wei) {
    return mscIntf.clientUtils.convertToMusicoinUnits(wei);
  },
  _getLicenseValue: function(work, field, defaultValue) {
    if (!work || !work.license) return defaultValue;
    return work.license[field];
  }
});
