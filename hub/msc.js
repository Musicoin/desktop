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

/* here I define backend restricted storage that is not accessible directly from interface */
var beRestricted = {
  currentKeystore:null,
  currentPrivateKeystore:null,
}

var cloneByValue = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
initObservables(mschub);
/* as it's not possible to define observables with initObservables having initial values depending on objects in this module scope we must define them separately.
TODO: make it possible. */
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
    },
    audio:{
      togglePlayState:function(elem, params, fns){
        return ['VOILA!',this];
      },
      skipTrack:function(elem, params, fns){

      },
    },
    finops:{
      sendTip:function(elem, params, fns){

      },
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
//mschub.fnPool('chain','disconnect');

//console.log(localStorage);
// console.log(sessionStorage);

/* Here we export the hub's reference to be accessible for the interface */
exports.mscdata = mschub

setTimeout(function(){
  mschub.lang = 'se';
  mschub.locale = locale[mschub.lang];
},7500)
