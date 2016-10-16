mscbuffer = require('./databuffer.js');
locale = require('./locale.js');
observable = require('./observable-factory.js');
console = require('./console.log.js');

var mschub = {
  data: {
    some_data: ''
  },
  toolSettings:{
    userImagePath:'images/'
  }
}
observable(mschub,'lang','en');
observable(mschub,'locale',locale[mschub.lang]);
observable(mschub,'userDetails',{
  image:'user.png',
  name:'Johnny Appleseed',
  nick:''
});
observable(mschub.toolSettings,'userImagePath','images/');

mschub.localeStrings = locale[mschub.lang]

exports.mscdata = mschub
exports.feedback = function (data) {
  console.log(data);
}


setTimeout(function(){
  mschub.lang = 'se';
  mschub.locale = locale[mschub.lang];
},7500)
