module.exports = (function(logDir){
    var util = require('util');
    var fs = require('fs');
    var logFile = fs.createWriteStream(logDir + '/background.log', { flags: 'a' });
    return {
        log:function(x){
            process.stdout.write(util.format.apply(util, arguments)+'\n');
            logFile.write(util.format.apply(null, arguments) + '\n');
        }
    }
});
