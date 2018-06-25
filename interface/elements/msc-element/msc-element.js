Polymer({
  is: 'msc-element',
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('hideIntroWindow')
      .to('selectedPage');
  },
  attached: function() {},
  properties: {
    selectedPage: {
      type: String,
      observer: '_pageChanged',
      reflectToAttribute: true,
    },
    loginLock: {
      type: Boolean,
      reflectToAttribute: true,
    },
    lang: {
      type: String,
      observer: '_langChanged',
      value: mscIntf.lang,
    },
    locale: Object,
    loggedIn: Boolean,
  },
  _pageChanged: function(newValue) {
    // First page load
    if (newValue == '') {
      mscIntf.selectedPage = "myp";
    } else {
      // unnecessary check, but just to make it clear that we won't get a stack overflow due to the
      // two way sync between the local property and the global one.
      if (mscIntf.selectedPage != newValue) {
        mscIntf.selectedPage = newValue;
      }
    }
  },
  _langChanged: function(newValue) {}
});
