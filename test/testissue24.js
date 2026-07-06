var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testissue24.xml' ]);

describe("Unit Tests for Issue #24", function() {
  it("accepts mysql formatter language without splitting not-equals", function(done) {
    var query = mybatisMapper.getStatement('issue24', 'notEquals', {
      name: 'Fuji'
    }, { language: 'mysql', indent: ' ' });

    assert.ok(query.indexOf("!=") > -1);
    assert.equal(query.indexOf("! ="), -1);
    done();
  });
});
