var assert = require('assert');
var mybatisMapper = require('../index');
var pkg = require('../package.json');

mybatisMapper.createMapper([ './test/testissue27.xml' ]);

describe("Unit Tests for Issue #27", function() {
  it("documents the minimum Node version needed by formatter dependencies", function(done) {
    assert.equal(pkg.engines.node, '>=12');
    done();
  });

  it("can build a statement without loading the SQL formatter", function(done) {
    var query = mybatisMapper.getStatement('issue27', 'withoutFormat', {
      id: 7
    }, null);

    assert.ok(query.indexOf("id = '7'") > -1);
    done();
  });
});
