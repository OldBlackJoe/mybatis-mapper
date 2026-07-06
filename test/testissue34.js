var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testissue34.xml' ]);

describe("Unit Tests for Issue #34", function() {
  it("does not double escape single quotes in string parameters", function(done) {
    var query = mybatisMapper.getStatement('issue34', 'quoteParam', {
      address: "SK Leaders' VIEW"
    }, null);

    assert.ok(query.indexOf("'SK Leaders'' VIEW'") > -1);
    assert.equal(query.indexOf("\\''"), -1);
    done();
  });
});
