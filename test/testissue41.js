var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testissue41.xml' ]);

describe("Unit Tests for Issue #41", function() {
  it("ignores parameter-like tokens inside quoted SQL text", function(done) {
    var query = mybatisMapper.getStatement('issue41', 'literalPlaceholders', null, null);

    assert.ok(query.indexOf("'/data/${yyyymmdd}/log'") > -1);
    assert.ok(query.indexOf("'#{notParam}'") > -1);
    assert.ok(query.indexOf("'it''s ${token}'") > -1);
    done();
  });

  it("still throws for unconverted parameters outside quoted SQL text", function(done) {
    assert.throws(function() {
      mybatisMapper.getStatement('issue41', 'missingOutside', null, null);
    }, /Parameter \$\{missing} is not converted\./);
    done();
  });

  it("still throws for empty parameter tokens outside quoted SQL text", function(done) {
    assert.throws(function() {
      mybatisMapper.getStatement('issue41', 'emptyHashOutside', null, null);
    }, /Parameter #\{} is not converted\./);

    assert.throws(function() {
      mybatisMapper.getStatement('issue41', 'emptyDollarOutside', null, null);
    }, /Parameter \$\{} is not converted\./);
    done();
  });
});
