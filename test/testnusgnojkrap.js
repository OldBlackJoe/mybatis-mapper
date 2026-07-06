var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test/testnusgnojkrap.xml' ]);
var assert = require('assert');

describe("Unit Tests for Mybatis-mapper", function(){
  it("1) #{...} parameters", function(done){
    var param = {};

    var query = mybatisMapper.getStatement('errorexample', 'errorSql', param);

    assert.equal(query.indexOf('SELECT VNS_IDX'), 2);
    assert.ok(query.indexOf('VNS_NUMBER') > -1);
    assert.equal(query.indexOf('#{vnsNumber}'), -1);

    done();
  });
});
