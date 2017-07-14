// reuse the gulp task that runs our app
var run = require('.')

describe('my app', function () {
    var nw, cri

    it('sends a message to the server', function (done) {
        // soon we will replace this with the instrumentation code
        setTimeout(done, 5000)
        nw = run()
    })

})
