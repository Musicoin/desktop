const os = require('os');
var appData = os.homedir() + "/.musicoin";

module.exports = (function(){
    var util = require('util');
    var fs = require('fs');
    var logFile = fs.createWriteStream(appData + '/logs/background.log', { flags: 'a' });
    return {
        log:function(x){
            process.stdout.write(util.format.apply(util, arguments)+'\n');
            logFile.write(util.format.apply(null, arguments) + '\n');
        }
    }
})()
