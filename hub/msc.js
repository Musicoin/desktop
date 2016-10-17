//const mscbuffer = require('./databuffer.js');

/* locale is a set of strings to be fed to app depending on language chosen */
const locale = require('./locale.js');
/* observable-factory is responsible to make properties update respective Polymer elements upon update of property */
const observable = require('./observable-factory.js');
/* console - convenience console emulation to output messages to stdout */
const console = require('./console.log.js');
/* observables init array together with init fn */
const initObservables = require('./observables-defs.js');

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
observable(mschub,'locale',locale[mschub.lang]);

/* here we define functions pool. It can be called from the interface with respective fngroup and fn provided to execute function on backend and grab result */
mschub.fnPool = function(fngroup, fn, elem, params) {
  var fns = {
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
  return (fns[fngroup] && fns[fngroup][fn])?fns[fngroup][fn].call(this,elem, params, fns):{error:'Invalid function called'};
}
/* Here we export the hub's reference to be accessible for the interface */
exports.mscdata = mschub



setTimeout(function(){
  mschub.lang = 'se';
  mschub.locale = locale[mschub.lang];
},7500)
