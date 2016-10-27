setTimeout(()=>{require('nw.gui').Window.get().showDevTools()},300);
var mscomm;

(function (document) {
  'use strict';
  setTimeout(()=>{
    console.log(nw.process.mainModule);
  },1500)
  console.log(mscIntf);
  var app = document.querySelector('#app');
  app.baseUrl = '/';
  if (window.location.port === '') {
  }
  // app.addEventListener('dom-change', function () {
  //   console.log('Our app is ready to rock!');
  // });

  window.addEventListener('WebComponentsReady', function () {
    /* done this way to not spawn 'new' objects on reconnection attempts. These objects cannot be GCd effectively as dead WS is still WS. So would accumulate. With single instance there is no such problem. */
      mscomm = estWS.init("localhost",22222,'',app);
      setTimeout(function () {
        mscomm.ws.send('present');
      }, 5400);

    if (mscIntf.ui.dan) {
      [].forEach.call(document.querySelectorAll('.drawer-menu'), function(el) {
        el.addEventListener('iron-select',function(ev){
          document.querySelector('#app').setAttribute('selected-page',ev.target.selected);
        },true);
      });
    }
  });

})(document);
