var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test/testequalsignorecase.xml' ]);
var assert = require('assert');

describe("Unit Tests for Issue of Equals ignore case", function(){
    it("1) test for ignore case", function(done){

        var param = {
            page_size : 10,
            page: "page1",
            price : 100
        }
        var format = {language: 'sql', indent: ' '};
        var query = mybatisMapper.getStatement('testEqualsIgnoreCase', 'findOne', param, format);
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
