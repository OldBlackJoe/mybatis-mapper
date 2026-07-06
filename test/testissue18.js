var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testissue18.xml' ]);

describe("Unit Tests for Issue #18", function() {
  it("can return formatted SQL keywords in lowercase", function(done) {
    var query = mybatisMapper.getStatement('issue18', 'lowercaseKeywords', {
      id: 7
    }, { language: 'sql', keywordCase: 'lower' });

    assert.equal(query.trim().indexOf('select'), 0);
    assert.ok(query.indexOf('\nfrom\n') > -1);
    assert.ok(query.indexOf('\nwhere\n') > -1);
    assert.equal(query.indexOf('SELECT'), -1);
    done();
  });
});
