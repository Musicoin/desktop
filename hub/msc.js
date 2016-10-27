
/* static data is a set of template data that never changes */
const staticData = require('./static-data.js');
/* locale is a set of strings to be fed to app depending on language chosen */
const locale = require('./locale.js');
/* observable-factory is responsible to make properties update respective Polymer elements upon update of property */
const observable = require('./observable-factory.js');
/* console - convenience console emulation to output messages to stdout */
const console = require('./console.log.js');
/* observables init array together with init fn */
const initObservables = require('./observables-defs.js');
/* crypto for pwd ops */
const crypto = require('crypto');
const fs = require('fs');
/* node localstorage to ensure existence of a kind of app storage without db. Can be substituted later with a kind of encrypted store */
const lStorage = require('node-localstorage');
var settings;
try {
  settings = require('../config/config.ext.js');
} catch (e) {
  settings = require('../config/config.std.js');
}
/* express like (better) net server */
const koa = require('koa')
const route = require('koa-route')
const websockify = require('koa-websocket');
const session = require('koa-session');
const comm = websockify(koa());

/* here I define backend restricted storage that is not accessible directly from interface */
var beRestricted = {
  currentKeystore:null,
  currentPrivateKeystore:null,
}

var cloneByValue = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var netSrvSession = session(comm);

var localStorage = global.localStorage;
var sessionStorage = global.sessionStorage;
/* here we define main data hub object and include some static properties directly */
var mschub = {
  audioElement:null,
  toolSettings:{
  },
  financialData:{

  },
  worksEditor: {

  },
}


/* here we init observables defined in observables-defs.js */
var PropertyChangeSupport = require('./pcs.js');
var pcs = new PropertyChangeSupport(mschub);
initObservables(mschub);

// TODO: Probably pull these into initObservables


pcs.addObservable('currentAudioUrl', '');
pcs.addObservable('myWorks', []);
pcs.addObservable('selectedWork', null);
pcs.addObservable('transactionHistory', []);

// TODO: Added this temporarily. Removing lightwallet
pcs.addObservable('loggedIn', false);
pcs.addObservable('loginError', false);

// TODO: Seems like it would be better to have a more modular structure
mschub.audioHub = {};
var pcsAudio = new PropertyChangeSupport(mschub.audioHub);
pcsAudio.addObservable('playlist', []);
pcsAudio.addObservable('currentPlay', {});
pcsAudio.addObservable('playPendingPayment', {});
pcsAudio.addObservable('playbackPaymentPercentage', staticData.playback.playbackPaymentPercentage);

/* as it's not possible to define observables with initObservables having initial values depending on objects in this module scope we must define them separately.
TODO: make it possible. */
observable(mschub,'ui', settings.ui);
observable(mschub,'lightwallet', settings.lightwallet);
observable(mschub,'loginLock',true);
observable(mschub,'locale',locale[mschub.lang]);
observable(mschub,'chainReady',false);
observable(mschub,'chainSync',staticData.chain.syncTmpl);
observable(mschub,'ipfsReady',false);
observable(mschub,'serverReady',false);
observable(mschub,'userGuest',staticData.guestUser.entry);
observable(mschub,'userDetails',staticData.guestUser.entry);
observable(mschub,'listUsers',[staticData.guestUser.list]);
observable(mschub,'notifyAccCreateDialog',null);

var chain = require('./web3things.js');

// TODO: Had some trouble getting Lightclient to work, trying to find a workaround for now
var Web3Connector = require('./web3-connector.js');
var web3Connector = new Web3Connector();

var pcsFinData = new PropertyChangeSupport(mschub.financialData);
pcsFinData.addObservable('userBalance', 0);

console.log("selectedAccount: " + web3Connector.getSelectedAccount())
pcsFinData.addObservable('selectedAccount', web3Connector.getSelectedAccount());

var MusicoinService = require("./musicoin-connector.js");
var musicoinService = new MusicoinService(staticData.musicoinHost, web3Connector);
pcs.addObservable('catalogBrowseItems', []);
pcs.addObservable('browseCategories', []);

var IPFSConnector = require("./ipfs-connector.js");
var ipfsConnector = new IPFSConnector();

/* here we define functions pool. It can be called from the interface with respective fngroup and fn provided to execute function on backend and grab result */
mschub.fnPool = function(fngroup, fn, elem, params) {
  var fns = {
    chain:{
      connect: function(elem, params, fns){
        return {result: chain.chainConnect()};
      },
      disconnect: function(elem, params, fns){
        return {result: chain.chainDisconnect()};
      },
      watch: function(elem, params, fns){
        chain.watch((ready)=>{mschub.chainReady = ready}, (sync)=>{sync.start!==undefined && sync.max!==undefined && (sync.syncProgress = (Math.round(sync.current/sync.max*10000)/100), mschub.chainSync = sync)});

        return {result:'watching'}
      },
      unwatch: function(elem, params, fns){
        chain.unwatch();
        return {result:'unwatched'}
      },
      createKeystore(elem, params, fns){
        chain.createKeystore(null,(ks)=>{beRestricted.currentKeystore = ks},(ks)=>{});
        return {result:'pending'}
      },
      createPrivateAccount(elem, params, fns){
        chain.createKeystore(params.pwd, (ks)=>{beRestricted.currentPrivateKeystore = ks}, (result)=>{console.log('RESVAL:',result);mschub.notifyAccCreateDialog = result})
        return {result:'pending'}
      },
    },
    login:{
      internalHashString: function (str) {
        return crypto.createHash('sha256').update(str).digest('hex');
      },
      updateUsersList: function () {
        var lsTable = localStorage.getItem('users_table');
        var tableOut = [staticData.guestUser.list];
        try {
          lsTable = JSON.parse(lsTable);
          for (var i = 0, item, entry; item = lsTable[i]; i++) {
            entry = JSON.parse(localStorage.getItem('user_'+item));
            if (entry) {
              tableOut.push({user:item, image:entry.external.image || 'internal/guestFace.svg', autoLogin:entry.autoLogin})
            }
          }
        } catch (err) {
          // nothing
        }
        mschub.listUsers = tableOut;
      },
      DEMOstoreLoginPwdHash: function(elem, params, fns){
        localStorage.clear()
        var data2store = staticData.dummyTestData.user_japple;
        localStorage.setItem('user_japple', JSON.stringify(data2store));
        var data2store = staticData.dummyTestData.user_AkiroKurosawa;
        localStorage.setItem('user_AkiroKurosawa', JSON.stringify(data2store));
        var data2store = staticData.dummyTestData.user_JimBim;
        localStorage.setItem('user_JimBim', JSON.stringify(data2store));
        localStorage.setItem('users_table', JSON.stringify(['japple', 'AkiroKurosawa', 'JimBim']));
      },
      storeLoginPwdHash: function(elem, params, fns){
      },
      loadUserDataFromFile: function(elem, params, fns){
      },
      storeUserDataToFile: function(elem, params, fns){
      },
      logoutUser: function(elem, params, fns){
        sessionStorage.setItem('authenticated', null);
        mschub.loginLock = true;
        mschub.userDetails = staticData.guestUser.entry;
      },
      verifyLogin: function(elem, params, fns){
        var storeOpened = params.login=='Guest'?JSON.stringify(staticData.guestUser.entry):localStorage.getItem('user_'+params.login);
        if (storeOpened) {
          try {
            storeOpened = JSON.parse(storeOpened);
            if ((params.pwd && fns.login.internalHashString(params.pwd)==storeOpened.pwdHash) || storeOpened.autoLogin) {
              mschub.loginLock = false;
              sessionStorage.setItem('authenticated', storeOpened.login);
              localStorage.setItem('lastLogged', storeOpened.login);
              /* load here on-disk stored data */
              mschub.userDetails = storeOpened;
              /* i18n!!! */
              return {success:'Log in'}
            } else
            if (!params.pwd && !storeOpened.autoLogin) {
              /* i18n!!! */
              return {error:'No autologin enabled'}
            } else {
              /* i18n!!! */
              return {error:'Incorrect password'}
            }
          } catch (err) {
            /* i18n!!! */
            return {error:'Unable to parse store'}
          }

        } else {
          /* i18n!!! */
          return {error: 'No such user'}
        }
      },
      removeUser:  function(elem, params, fns){

      },
      updateLoginPwdHash: function(elem, params, fns){

      },
      loginToDefault: function(elem, params, fns) {
        mschub.loginError = null;
        web3Connector.storeCredentials(params.pwd)
          .then(function() {
            mschub.loggedIn = true;
            mschub.loginLock = false;
          })
          .catch(function(e) {
            mschub.loginError = "Login failed";
          });
      }
    },
    audio:{
      playAll: function(elem, params, fns) {
        mschub.audioHub.playlist = params.items;
        fns.audio.playNext(elem, {}, fns);
      },
      playNext: function(elem, params, fns) {
        mschub.audioHub.currentPlay = mschub.audioHub.playlist.shift() || {};
        mschub.audioHub.playPendingPayment = mschub.audioHub.currentPlay;
      },
      reportPlaybackPercentage: function(elem, params, fns) {
        if (params.percentage > mschub.audioHub.playbackPaymentPercentage) {
          var pending = mschub.audioHub.playPendingPayment;
          mschub.audioHub.playPendingPayment = null;
          if (pending) {
            fns.finops.payForPlay(elem, {
              address: pending.contract_id,
              weiAmount: pending.wei_per_play
            }, fns);
          }
        }
      }
    },
    catalog: {
      loadBrowsePage: function(elem, params, fns) {
        mschub.catalogBrowseItems = [];
        musicoinService.loadBrowsePage(params.page, params.keyword, function(result) {
          mschub.catalogBrowseItems = result;
        });
        return {result: "pending"};
      },
      loadBrowseCategories: function(elem, params, fns) {
        musicoinService.loadBrowseCategories(function(result) {
          mschub.browseCategories = result;
        });
        return {result: "pending"};
      },
      loadMyWorks: function(elem, params, fns) {
        musicoinService.loadMyWorks(web3Connector.getDefaultAccount())
          .then(function(result) {
            mschub.myWorks = result;
          });
        return {result: "pending"};
      }
    },
    publish: {
      releaseWork: function(elem, params, fns) {
        var work = params.work;
        var workReleaseRequest = {
          type: work.type,
          title: work.title,
          artist: work.artist,
          imageUrl: "",
          metadataUrl: ""
        };

        work.releaseStatus = "Publishing artwork...";
        ipfsConnector.add(work.imgFile)
          .then(function (hash) {
            workReleaseRequest.imageUrl = "ipfs://" + hash;
            work.releaseStatus = "Publishing metadata...";
            return ipfsConnector.addString(JSON.stringify(work.metadata));
          })
          .then(function (hash) {
            workReleaseRequest.metadataUrl = "ipfs://" + hash;
            work.releaseStatus = "Releasing work...";
            return web3Connector.releaseWork(workReleaseRequest);
          })
          .then(function (contractAddress) {
            work.releaseStatus = "Success!";
            work.contract_address = contractAddress;
            return contractAddress;
          })
          .catch(function(err) {
            work.releaseStatus = "Failed: " + err;
          });
      },
      releaseLicense: function(elem, params, fns) {
        var license = params.license;
        var work = params.work;
        var licenseReleaseRequest = {
          workAddress: work.contract_address,
          coinsPerPlay: license.coinsPerPlay,
          resourceUrl: "",
          metadataUrl: "",
          royalties: license.royalties.map(function (r) {return r.address}),
          royaltyAmounts: license.royalties.map(function (r) {return r.amount}),
          contributors: license.contributors.map(function (r) {return r.address}),
          contributorShares: license.contributors.map(function (r) {return r.shares}),
        };

        license.releaseStatus = "Publishing audio...";
        ipfsConnector.add(license.audioFile)
          .then(function (hash) {
            licenseReleaseRequest.resourceUrl = "ipfs://" + hash;
            license.releaseStatus = "Publishing metadata...";
            return ipfsConnector.addString(JSON.stringify(license.metadata));
          })
          .then(function (hash) {
            licenseReleaseRequest.metadataUrl = "ipfs://" + hash;
            license.releaseStatus = "Releasing license...";
            return web3Connector.releaseLicense(licenseReleaseRequest);
          })
          .then(function (contractAddress) {
            license.releaseStatus = "Success!";
            license.contract_id = contractAddress;  // TODO: be consistent with work
            return contractAddress;
          })
          .catch(function(err) {
            license.releaseStatus = "Failed: " + err;
          });
      }
    },
    finops:{
      sendTip:function(elem, params, fns){
        var wei = params.weiAmount ? params.weiAmount : web3Connector.toIndivisibleUnits(params.musicoinAmount);
        web3Connector.tip({amount: wei, to: params.address})
        .then(function(tx) {
          // TODO: Add to pending payments
          console.log("Waiting for transaction: " + tx);
          return web3Connector.waitForTransaction(tx);
        })
        .then(function(receipt) {
          // TODO: Remove from pending payments
          console.log(JSON.stringify(receipt));
        });
      },
      payForPlay: function(elem, params, fns) {
        var wei = params.weiAmount ? params.weiAmount : web3Connector.toIndivisibleUnits(params.musicoinAmount);
        web3Connector.ppp({to: params.address, amount: wei})
          .then(function(tx) {
            // TODO: Add to pending payments
            console.log("Waiting for transaction: " + tx);
            return web3Connector.waitForTransaction(tx);
          })
          .then(function(receipt) {
            // TODO: Remove from pending payments
            console.log(JSON.stringify(receipt));
          });
      },
      loadHistory: function(elem, params, fns) {
        web3Connector.loadHistory()
          .then(function (history) {
            mschub.transactionHistory = history;
          });
      },
      updateUserBalance: function(elem, params, fns) {
        mschub.financialData.userBalance = web3Connector.getUserBalanceInMusicoin();
      }
    }
  };
  /* Here we either call a function called by fngroup/fn (and return its return) providing it with element object, passed parameters, fns var (to make sure functions can communicate and call themselves if needed) and setting 'this' to module exports (in this case mschub) or return object with one member - error to be managed by window. */
  return (fns[fngroup] && fns[fngroup][fn])?(mschub.loginLock && ~['chain', 'audio'].indexOf(fngroup))?{error:'No user logged in'}:fns[fngroup][fn].call(this,elem, params, fns):{error:'Invalid function called'};
}

mschub.fnPool('login','DEMOstoreLoginPwdHash');
mschub.fnPool('login','updateUsersList');
mschub.fnPool('login','verifyLogin',null,{login:'japple', pwd:'Musicoin'});
mschub.fnPool('chain','watch');
mschub.fnPool('chain','connect');
// mschub.fnPool('chain','createKeystore');
//mschub.fnPool('chain','createPrivateAccount',null,{pwd:'pass'});
mschub.fnPool('login','logoutUser');

mschub.fnPool('catalog','loadBrowseCategories');

//mschub.fnPool('chain','disconnect');

//console.log(localStorage);
// console.log(sessionStorage);

// Setup facades for Dan's sanity
mschub.audio = require('../facade/audio.js')(mschub);
mschub.payments = require('../facade/payments.js')(mschub);
mschub.catalog = require('../facade/catalog.js')(mschub);
mschub.login = require('../facade/login.js')(mschub);

/* Here we export the hub's reference to be accessible for the interface */
exports.mscdata = mschub

/* websockets and other comm */
comm.ws.use(route.all('/', function* (next) {
  this.websocket.on('message', function(message) {


    console.log(message);
  });
  this.websocket.send('Hello Client!');
  yield next;
}));

setTimeout(()=>{console.log('init');comm.listen(22222);},3000)

mschub.fnPool('finops', 'updateUserBalance');
setInterval(()=>{
  mschub.fnPool('finops', 'updateUserBalance')});
