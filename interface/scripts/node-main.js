
setTimeout(function(){
	v = require('../dummy.js')

},2500);

(function(){
  var i = 0;
  exports.callback0 = function () {
		return 'abc';

		// console.log(i + ": " + window.location);
    // window.alert ("i = " + i);
    // i = i + 1;
  }
})();

(function(){
  exports.datai = 'zzz';
})();
