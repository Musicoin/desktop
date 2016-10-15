mscbuffer = require('./databuffer.js');//aa
/* Data to be passed to window */
var mschub = {
  data: {
    some_data: ''
  }
}
exports.mscdata = mschub.data
exports.feedback = function (data) {
  console.log(data);
}
