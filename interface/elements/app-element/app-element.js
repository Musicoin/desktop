
    Polymer({
      is: 'app-element',
      ready:function(){
        mscIntf.locale = {register:this,prop:'locale'}
        mscIntf.loginLock = {register:this,prop:'loginLock'}
        mscIntf.attach(this)
          .to('catalogBrowseItems')
          .to('browseCategories');

        this.$.browse.addEventListener('selected', function(e) {
          mscIntf.audio.playAll(e.detail);
        });
      },
      properties: {
        selectedPage: {
          type: String,
          observer: '_pageChanged',
          value: "rel",
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
    //   ready: function() {
    //     musicoin = getMusicoin();
    //     this.account = blockchain.getDefaultAccount();
    //     this.page = 'player-view';
    //     var that = this;
    //     player = this.$.player;
    //     that.updateUserBalance(that);
    //     window.setInterval(function() {
    //       that.updateUserBalance(that);
    //     }, 10000); // should make this event driven
    //
    //     this.$.player.addEventListener('timeupdate', function() {
    //       var progress_percent = player.currentTime / player.duration * 100;
    //       that.$.progress.value = progress_percent;
    //       if (progress_percent > 70 && that.pendingTransaction) {
    //         var tmpPending = that.pendingTransaction;
    //         that.pendingTransaction = null;
    //         that.async(tmpPending.commit);
    //       }
    //     });
    //
    //     var updatePlayState = function() {that.$.playButton.icon = that.$.player.paused ? 'av:play-arrow' : 'av:pause';};
    //     this.$.player.addEventListener('playing', updatePlayState);
    //     this.$.player.addEventListener('play', updatePlayState);
    //     this.$.player.addEventListener('pause', updatePlayState);
    //     this.$.player.addEventListener('abort', updatePlayState);
    //
    //     setupDebugLogging();
    //     this.categories = musicoinService.getCategories();
    //
    //     // TODO: Get rid of this stupid code.
    //     window.setTimeout(function() {
    //       // This sucks.  wtf?!  I can't get the page to select on the left nav.  I hate routes.
    //       that.$.pages.selected = 'player-view';
    //       that.set('route.path', '/player-view/new');
    //     }, 1000);
    //   },
    //
    //   checkForEnter: function (e) {
    //     // check if 'enter' was pressed
    //     if (e.keyCode === 13) {
    //       this.password = this.$.loginPwd.value;
    //       try {
    //         if (blockchain.checkAuth(this.password)) {
    //           this.hideLoginWindow();
    //           return;
    //         }
    //       }
    //       catch (e) {
    //         console.log(e);
    //       }
    //
    //       // if we get here, something didn't go as planned.
    //       this.$.loginPwd.value = '';
    //     }
    //   },
    //
    //   hideLoginWindow: function() {
    //     this.$.loginWindow.style.opacity = 0;
    //     window.setTimeout(function(){
    //       musicoin.$.loginWindow.style.display = 'none';
    //     }, 500);
    //   },
    //
    //   toggleTxDetailView: function() {
    //     this.toggle(this.$.txDetailView);
    //     this.hide(this.$.trackDetailView);
    //   },
    //
    //   hide: function(target) {
    //     target.style.display = 'none';
    //   },
    //
    //   toggle: function(target, beforeShow) {
    //     if (target.style.display == 'none' || target.style.display == '') {
    //       if (!beforeShow || beforeShow()) {
    //         target.style.display = 'block';
    //       }
    //     }
    //     else {
    //       target.style.display = 'none';
    //     }
    //   },
    //
    //   toggleTrackDetailView : function() {
    //     this.toggle(this.$.trackDetailView, function() {
    //       return musicoin.currentTransactionInfo;
    //     });
    //     this.hide(this.$.txDetailView);
    //   },
    //
    //   togglePlayState: function() {
    //     if (this.$.player.paused) {
    //       if (this.$.player.readyState > 0) {
    //         this.$.player.play();
    //       }
    //     }
    //     else {
    //       this.$.player.pause();
    //     }
    //   },
    //
    //   updateUserBalance: function(self) {
    //     var weiBalance = blockchain.getUserBalance();
    //     self.userBalance = this.formatAsMusicoin(weiBalance);
    //     self.pendingPayments = web3.fromWei(pendingPayments, 'ether');
    //   },
    //
    //   formatAsMusicoin: function (wei) {
    //     var eth = web3.toBigNumber(web3.fromWei(wei, 'ether'));
    //     return eth.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //   },
    //
    //   addPendingPayment : function(value) {
    //     pendingPayments = pendingPayments.plus(value);
    //     this.updateUserBalance(this);
    //   },
    //
    //   skipTrack: function() {
    //     this.playNext();
    //   },
    //
    //   playAll: function(items) {
    //     this.playlist = (this.playlist || []).concat(items);
    //     this.playNext();
    //   },
    //
    //   addToPlaylist: function(item) {
    //     this.playist.push(item);
    //   },
    //
    //   playNext: function() {
    //     var next = this.playlist.shift();
    //     if (next) {
    //       this.playSelection(next);
    //     }
    //   },
    //
    //   playSelection: function(item) {
    //     var ppp = this.getContractInstance(item);
    //     var coinsPerPlay = blockchain.getCoinsPerPlay(item.contractId);
    //     var transactionInfo = {
    //         item: item,
    //         contractId: item.contractId,
    //         ppp: ppp,
    //         coinsPerPlay: coinsPerPlay
    //     };
    //     this.getPermission(item.track, coinsPerPlay, false, function(){
    //      musicoin.playSelectionWithPermission(transactionInfo);
    //     });
    //   },
    //
    //   getContractInstance: function(item) {
    //     return web3.eth.contract(this.getContractAbiFromCatalog(item.contractId)).at(item.contractId);
    //   },
    //
    //   getContractAbiFromCatalog: function (id) {
    //     // TODO: The abi should be registered with the contract in the catalog
    //     // The catalog contract abi can be hardcoded into the client.
    //     return pppAbi;
    //   },
    //
    //   getPermission: function(msg, value, forcePrompt, onGranted) {
    //     if (!forcePrompt && this.password) {
    //       onGranted();
    //     }
    //     else {
    //       this.amountToPay = this.formatAsMusicoin(value);
    //       this.confirmationMessage = msg;
    //       this.permissionGrantedCallback = onGranted;
    //       this.$.paymentApprovalDialog.open();
    //     }
    //   },
    //
    //   onPermissionGranted: function() {
    //     this.password = this.$.pwd.value;
    //     if (this.permissionGrantedCallback) {
    //       this.permissionGrantedCallback();
    //     }
    //   },
    //
    //   playSelectionWithPermission: function(transactionInfo) {
    //     if (this.pendingTransaction) {
    //       var tmp = this.pendingTransaction;
    //       this.pendingTransaction = null;
    //       tmp.cancel();
    //     }
    //     if (this.playAudio(transactionInfo)) {
    //       this.addPendingPayment(transactionInfo.coinsPerPlay);
    //       this.pendingTransaction = {
    //         item : transactionInfo.item,
    //         contract: transactionInfo.ppp,
    //         approvedAmount: transactionInfo.coinsPerPlay,
    //         cancel: function() {
    //           musicoin.addPendingPayment(-transactionInfo.coinsPerPlay);
    //         },
    //         commit: function() {
    //           musicoin.sendPayment(transactionInfo);
    //         }
    //       };
    //     }
    //   },
    //
    //   sendTip: function() {
    //     var txInfo = this.currentTransactionInfo;
    //     if (txInfo) {
    //       musicoinService.addFavorite(txInfo.contractId);
    //       var amount = web3.toWei(1, 'ether');
    //       this.getPermission("Tip for '" + this.track + "' by " + this.artist, amount, true, function(){
    //         musicoin.addPendingPayment(amount);
    //         musicoin.payForTip(txInfo.ppp, amount, musicoin.password, musicoin.createPaymentListener(amount));
    //       });
    //     }
    //   },
    //
    //   sendPayment: function(transactionInfo) {
    //     this.payForPlay(
    //             transactionInfo.ppp,
    //             transactionInfo.coinsPerPlay,
    //             this.password,
    //             this.createPaymentListener(transactionInfo.coinsPerPlay));
    //   },
    //
    //   createPaymentListener: function(amount) {
    //     return {
    //       onPaymentInitiated: function () {
    //         console.log("Payment initiated");
    //       },
    //       onPaymentComplete: function () {
    //         console.log("Payment success!");
    //         musicoin.$.successToast.open();
    //         musicoin.addPendingPayment(-amount);
    //       },
    //       onFailure: function (err, isAuthFail) {
    //         console.log("Payment failed: " + err + ", authFailed: " + isAuthFail);
    //         musicoin.$.failureToast.open();
    //         musicoin.addPendingPayment(-amount);
    //         if (isAuthFail) {
    //           musicoin.password = "";
    //         }
    //       },
    //       onStatusChange: function (msg) {
    //         console.log(msg)
    //       }
    //     }
    //   },
    //
    //   payForTip: function(ppp, weiApproved, pwd, callback) {
    //     blockchain.tip({amount: weiApproved, to: ppp.address}, pwd, callback);
    //   },
    //
    //   payForPlay: function(ppp, weiApproved, pwd, callback) {
    //     blockchain.ppp({to: ppp.address, amount: weiApproved}, pwd, callback);
    //   },
    //
    //   playAudio: function (transactionInfo) {
    //     var resolved = this.convertToUrl(transactionInfo.ppp.resourceUrl());
    //     if (resolved) {
    //       player.src = resolved;
    //       player.load();
    //       this.currentTransactionInfo = transactionInfo;
    //       this.track = transactionInfo.item.track;
    //       this.album = transactionInfo.item.album;
    //       this.artist = transactionInfo.item.artist;
    //       this.artworkUrl = transactionInfo.item.img;
    //       return true;
    //     }
    //   },
    //
    //   _clearCurrentTrack: function() {
    //     player.src = '';
    //   },
    //
    //   convertToUrl: function(resourceUri) {
    //     if (resourceUri.startsWith("ipfs://")) {
    //       var ipfsHash = resourceUri.substring(7, resourceUri.length);
    //       return this.hashToURL(ipfsHash);
    //     }
    //     return null;
    //   },
    //
    //   hashToURL: function(hash) {
    //     return "http://localhost:8080/ipfs/" + hash;
    //   },
    //
    //   observers: [
    //     '_routePageChanged(routeData.page)',
    //     '_subrouteChanged(subroute)',
    //   ],
    //
    //   _routePageChanged: function(page) {
    //     this.page = page || 'player-view';
    //   },
    //
    //   _subrouteChanged: function(subroute) {
    //     if (subroute.prefix == "/player-view") {
    //       var pageName = subroute.path.substring(1); // "/page-name" -> "page-name"
    //       musicoinService.loadContractsFromURL(pageName, function (groups) {
    //         musicoin.$.browse.setDataModel(groups);
    //       })
    //     }
    //   },
    //
    //   _pageChanged: function(page) {
    //     console.log("pageChanged: " + page);
    //     // Load page import on demand. Show 404 page if fails
    //     var resolvedPageUrl = this.resolveUrl('my-' + page + '.html');
    //     this.importHref(resolvedPageUrl, null, this._showPage404, true);
    //   },
    //
    //   _showPage404: function() {
    //     this.page = 'player-view';
    //   }
    // });
    //
    // function getMusicoin() {
    //   return document.querySelector('app-element');
    // }
    //
    // function clearCurrentTrack() {
    //   musicoin._clearCurrentTrack();
    //   musicoin.playNext();
    // }
    //
    // function setupDebugLogging() {
    //   var fs = require('fs');
    //   var util = require('util');
    //   var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
    //   // Or 'w' to truncate the file every time the process starts.
    //   var logStdout = process.stdout;

//      var old = console.log;
//      console.log = function () {
//        old(arguments[0]);
//        logFile.write(util.format.apply(null, arguments) + '\n');
//        logStdout.write(util.format.apply(null, arguments) + '\n');
//      }
//      console.error = console.log;
//    }


// var Web3 = require('web3');
// var web3 = new Web3();
// var BigNumber = require('bignumber.js');
// //web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
// var blockchain = new Web3Connector();
// var musicoinService = new MusicoinConnector(web3);
// var pendingPayments = new BigNumber(0);
// var player;
// var pendingPaymentAction;
// var musicoin;
// var pppAbi = [{"constant":true,"inputs":[],"name":"resourceUrl","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"_distributeBalanceFirst","type":"bool"}],"name":"kill","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"metadata","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalShares","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"collectPendingPayment","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"licenseVersion","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"metadataVersion","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"coinsPerPlay","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"shares","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalEarned","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"distributeBalance","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"newMetadata","type":"string"}],"name":"updateMetadata","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"newResourceUrl","type":"string"}],"name":"updateResourceUrl","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"play","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"playCount","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"contractVersion","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"pendingPayment","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_coinsPerPlay","type":"uint256"},{"name":"_recipients","type":"address[]"},{"name":"_shares","type":"uint256[]"}],"name":"updateLicense","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"recipients","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"type":"function"},{"inputs":[{"name":"_coinsPerPlay","type":"uint256"},{"name":"_resourceUrl","type":"string"},{"name":"_metadata","type":"string"},{"name":"_recipients","type":"address[]"},{"name":"_shares","type":"uint256[]"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"plays","type":"uint256"}],"name":"playEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"version","type":"uint256"}],"name":"licenseUpdateEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldOwner","type":"address"},{"indexed":false,"name":"newOwner","type":"address"}],"name":"transferEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldResource","type":"string"},{"indexed":false,"name":"newResource","type":"string"}],"name":"resourceUpdateEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldResource","type":"string"},{"indexed":false,"name":"newResource","type":"string"}],"name":"metadataUpdateEvent","type":"event"}]
// var loggerAbi = [ { "constant": false, "inputs": [ { "name": "oldOwner", "type": "address" }, { "name": "newOwner", "type": "address" } ], "name": "logTransferEvent", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "oldResource", "type": "string" }, { "name": "newResource", "type": "string" } ], "name": "logResourceUpdateEvent", "outputs": [], "type": "function" }, { "constant": false, "inputs": [], "name": "MusicCoinLogger", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "version", "type": "uint256" } ], "name": "logLicenseUpdateEvent", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "oldMetadata", "type": "string" }, { "name": "newMetadata", "type": "string" } ], "name": "logMetadataUpdateEvent", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "plays", "type": "uint256" } ], "name": "logPlayEvent", "outputs": [], "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "plays", "type": "uint256" } ], "name": "playEvent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "version", "type": "uint256" } ], "name": "licenseUpdateEvent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "oldOwner", "type": "address" }, { "indexed": false, "name": "newOwner", "type": "address" } ], "name": "transferEvent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "oldResource", "type": "string" }, { "indexed": false, "name": "newResource", "type": "string" } ], "name": "resourceUpdateEvent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "oldResource", "type": "string" }, { "indexed": false, "name": "newResource", "type": "string" } ], "name": "metadataUpdateEvent", "type": "event" } ];
