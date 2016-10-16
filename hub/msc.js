mscbuffer = require('./databuffer.js');//aa
/* Data to be passed to window */
var mschub = {
  data: {
    some_data: ''
  },
  userDetails:{
    image:'user.png',
    name:'Johnny Appleseed',
    nick:''
  },
  toolSettings:{
    userImagePath:'images/'
  }
}
exports.mscdata = mschub
exports.feedback = function (data) {
  console.log(data);
}
