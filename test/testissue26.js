var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testissue26.xml' ]);

describe("Unit Tests for Issue #26", function() {
  it("parses foreach attributes with spaces around equals", function(done) {
    var query = mybatisMapper.getStatement('issue26', 'insertMany', {
      list: [
        { dasd: 'a', sad: 'b', dsa: 'c' },
        { dasd: 'd', sad: 'e', dsa: 'f' }
      ]
    }, { language: 'mysql', indent: ' ' });

    assert.ok(query.indexOf("('a', 'b', 'c')") > -1);
    assert.ok(query.indexOf("('d', 'e', 'f')") > -1);
    done();
  });
});
