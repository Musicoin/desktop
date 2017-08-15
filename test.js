var assert = require('assert')
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var wd = require('wd');
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

describe('mocha spec examples', function() {
  this.timeout(10000);

  describe("using promises and chai-as-promised", function() {
    var browser;

    before(function() {
      browser = wd.promiseChainRemote();

      // optional extra logging
      browser.on('status', function(info) {
        console.log(info.cyan);
      });
      browser.on('command', function(eventType, command, response) {
        console.log(' > ' + eventType.cyan, command, (response || '').grey);
      });
      browser.on('http', function(meth, path, data) {
        console.log(' > ' + meth.magenta, path, (data || '').grey);
      });

      return browser
        .init({browserName:'chrome'});
    });

    beforeEach(function() {
			return browser;
    });

    after(function() {
      return browser
        .quit();
    });

    it("should retrieve the page title", function() {
      return browser
        .title().should.become("Hello World!");
    });
  });
});
describe(' Is 1 == 2?', function(){
  it('obviously no', function()
    {
      assert.equal(1,2)
    });
});
