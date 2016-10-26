
    Polymer({
      is: 'msc-element',
      ready:function(){
        mscIntf.locale = {register:this,prop:'locale'}
        mscIntf.loginLock = {register:this,prop:'loginLock'}
        mscIntf.attach(this)
          .to('catalogBrowseItems')
          .to('browseCategories', function(oldValue, newValue) {
            this.browseCategories = newValue;
            if (this.selectedPage == "not-set" && this.browseCategories && this.browseCategories.length > 0) {
              this.selectedPage = newValue[0].id;
            }
          }.bind(this));

        this.$.browse.addEventListener('selected', function(e) {
          mscIntf.audio.playAll(e.detail);
        });
      },
      properties: {
        selectedPage: {
          type: String,
          observer: '_pageChanged',
          value: "not-set",
          reflectToAttribute:true,
        },
        loginLock: {
          type: Boolean,
          reflectToAttribute:true,
        },
        lang:{
          type: String,
          observer: '_langChanged',
          value: mscIntf.lang,
        },
        catalogBrowseItems: {
          type: Array,
          observer: '_itemsChanged'
        },
        browseCategories: Array,
        browseViewItems: Array,
        locale: Object,
      },
      _pageChanged:function(newValue) {
        if (this.isBrowsePage(newValue)) {
          mscIntf.catalog.loadBrowsePage(newValue);
        }
        else if ("myw" === newValue) {
          mscIntf.catalog.loadMyWorks();
        }
      },
      _shouldHideBrowsePage() {
        return !this.isBrowsePage(this.selectedPage);
      },
      isBrowsePage: function(name) {
        return mscIntf.browseCategories.map(function(p) { return p.id}).includes(name);
      },
      _langChanged:function(newValue) {
        this.locale = mscIntf.localeStrings
        console.log(newValue);
      },
      _itemsChanged: function(newGroups) {
        // the browse view is generic, so it has its own object model
        var toViewItem = function(serverItem) {
          return {
            img: serverItem.work.image_url_https,
            line1: serverItem.song_name,
            line2: serverItem.artist_name,
            data: serverItem
          }
        };

        var toViewGroup = function(serverGroup) {
          return {
            name: serverGroup.title,
            items: serverGroup.result.map(toViewItem)
          }
        };

        this.browseViewItems = newGroups.map(toViewGroup);
      }
})
