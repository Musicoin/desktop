Polymer({
    is: 'msc-tip-button',
    properties: {
        tipStatus: {
            type: Number,
            value: 0
        },
        recipient: {
            type: String,
            reflectToAttribute: true,
            value: null
        },
        tipContract: {
            type: Boolean,
            reflectToAttribute: true,
            value: false
        },
        locale: Object
    },
    ready: function() {
        mscIntf.attach(this)
          .to('locale')
    },
    _computeTipPending: function() {
        return this.tipStatus == 1;
    },
    _computeTipFailed: function() {
        return this.tipStatus == 2;
    },
    _computeTipDisabled: function() {
        return !this.recipient;
    },
    _computeTipMessage: function() {
        if (!this.locale) return "";
        if (this.tipStatus == 0) return this.locale.artistView.labels.tip;
        if (this.tipStatus == 1) return this.locale.artistView.labels.tipPending;
        if (this.tipStatus == 2) return this.locale.artistView.labels.tipFailed;
        if (this.tipStatus == 3) return this.locale.artistView.labels.tipSuccess;
    },
    sendTip: function() {
        if (!this.recipient) return;
        if (this.tipStatus != 0) return;
        this.tipStatus = 1;
        window.setTimeout(function() {
            this.sendTipAsync();
        }.bind(this), 500);
    },
    sendTipAsync: function() {
        var tipAmountInMusicoin = 1;

        if (this.tipContract) {
            mscIntf.profile.addToPlaylist("My Favorites", this.recipient, true);
        }

        var promise = this.tipContract
          ? mscIntf.payments.sendTip(this.recipient, tipAmountInMusicoin)
          : mscIntf.payments.send(this.recipient, tipAmountInMusicoin);

          promise
              .bind(this)
              .then(function(){
                  this.tipStatus = 3;
                  window.setTimeout(function() {
                      this.tipStatus = 0;
                  }.bind(this), 1000);
              })
              .catch(function(err) {
                  this.tipStatus = 2;
              });
    }
});
