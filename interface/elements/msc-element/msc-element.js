
    Polymer({
      is: 'msc-element',
      ready:function(){
        mscIntf.locale = {register:this,prop:'locale'}
        mscIntf.loginLock = {register:this,prop:'loginLock'}
        mscIntf.ui = {register:this,prop:'ui'}
        mscIntf.lightwallet = {register:this,prop:'lightwallet'}
        mscIntf.attach(this)
          .to('catalogBrowseItems')
          .to('loggedIn')
          .to('browseCategories')
          .to('selectedPage');

        mscIntf.audioHub.attach(this)
          .to('currentPlay', function(oldValue, newValue) {
              this.currentPlayId = (newValue && newValue.contract_id) ? newValue.contract_id : "none";
          }.bind(this));

        mscIntf.userPreferences.attach(this)
          .to("musicianMode");

        this.$.browse.addEventListener('selected', function(e) {
          mscIntf.audio.playAll(e.detail);
        });

        this.$.browse.addEventListener('play', function(e) {
          mscIntf.audio.playAll(e.detail);
        });

        this.$.browse.addEventListener('shuffle', function(e) {
          mscIntf.audio.shuffleAll(e.detail);
        });

        this.$.browse.addEventListener('favorite', function(e) {
          mscIntf.profile.addToPlaylist(this.locale.general.favorites, e.detail.contract_id, true);
        }.bind(this));

        this.$.browse.addEventListener('line2-selected', function(e) {
          mscIntf.catalog.loadArtist(e.detail.work.owner_address);
          this.selectedPage = 'artist';
        }.bind(this));
      },
      attached: function(){
      },
      properties: {
        selectedPage: {
          type: String,
          observer: '_pageChanged',
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
        loggedIn: Boolean,
        ui: Object,
        musicianMode: Boolean,
        currentPlayId: String
      },
      _pageChanged: function(newValue) {
        // First page load
        if (newValue == '' && this.browseCategories != null && this.browseCategories.length > 0) {
          mscIntf.selectedPage = this.browseCategories[0].id;
        }
        else {
          if (this.isBrowsePage(newValue)) {
            mscIntf.catalog.loadBrowsePage(newValue);
          }
          else if ("myw" === newValue) {
            mscIntf.catalog.loadMyWorks();
          }
          else if ("history" === newValue) {
            mscIntf.payments.loadHistory();
          }

          // unnecessary check, but just to make it clear that we won't get a stack overflow due to the
          // two way sync between the local property and the global one.
          if (mscIntf.selectedPage != newValue) {
            mscIntf.selectedPage = newValue;
          }
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
      },
      _itemsChanged: function(newGroups) {
        // the browse view is generic, so it has its own object model
        var toViewItem = function(serverItem) {
          return {
            img: serverItem.work.image_url_https,
            line1: serverItem.song_name,
            line2: serverItem.artist_name,
            data: serverItem,
            id: serverItem.contract_id
          }
        };

        var toViewGroup = function(serverGroup) {
          return {
            name: serverGroup.title,
            items: serverGroup.result.map(toViewItem)
          }
        };

        this.browseViewItems = newGroups.map(toViewGroup);
      },
      _computeIconForCategory: function(category) {
        if (category.id == 'new-releases') return "social:whatshot";
        if (category.id == 'coinboard') return "icons:toll";
        return "av:art-track";
      }
});