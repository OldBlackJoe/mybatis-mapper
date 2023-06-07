var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test/testunderline.xml' ]);
var assert = require('assert');

describe("Unit Tests for Issue of mavridiSS", function(){
  it("1) test for Issue of mavridiSS", function(done){

    var param = {
        page_size : 10,
        page: 1,
        price : 100
    }
    var format = {language: 'sql', indent: ' '};
    var query = mybatisMapper.getStatement('testUnderline', 'findOne', param, format);
    assert.equal(query,
`
SELECT
  *
FROM
  article
WHERE
  name = '10'
`.trim())
    done();
  });
});