setTimeout(()=>{require('nw.gui').Window.get().showDevTools()},300);

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
      setTimeout(function () {
        console.log('initialized');
      }, 400);

      // [].forEach.call(document.querySelectorAll('.drawer-menu'), function(el) {
      //     el.addEventListener('iron-select',function(ev){
      //       document.querySelector('#app').setAttribute('selected-page',ev.target.selected);
      //     },true);
      //   });
  });

})(document);
