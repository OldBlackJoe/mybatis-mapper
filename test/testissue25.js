var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testissue25.xml' ]);

function countMatches(text, pattern) {
  var matches = text.match(pattern);
  return matches == null ? 0 : matches.length;
}

describe("Unit Tests for Issue #25", function() {
  it("keeps outer parameters when foreach item name overlaps a suffix", function(done) {
    var param = {
      item_name: 'a',
      main_name: [ 'b', 'c' ]
    };
    var query = mybatisMapper.getStatement('issue25', 'nameSuffix', param, { language: 'sql' });

    assert.equal(countMatches(query, /item_name = 'a'/g), 2);
    assert.ok(query.indexOf("main_name like CONCAT ('%', 'b', '%')") > -1);
    assert.ok(query.indexOf("main_name like CONCAT ('%', 'c', '%')") > -1);
    assert.equal(Object.prototype.hasOwnProperty.call(param, 'name'), false);
    done();
  });

  it("exposes foreach index without mutating outer params", function(done) {
    var param = {
      main_name: [ 'b', 'c' ]
    };
    var query = mybatisMapper.getStatement('issue25', 'foreachIndex', param, null);

    assert.ok(query.indexOf("'0':'b'") > -1);
    assert.ok(query.indexOf("'1':'c'") > -1);
    assert.equal(Object.prototype.hasOwnProperty.call(param, 'idx'), false);
    done();
  });
});
