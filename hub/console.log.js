module.exports = (function(){
    var util = require('util');
    return {
        log:function(x){
            process.stdout.write(util.format.apply(util, arguments)+'\n');
        }
    }
})()
