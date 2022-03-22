var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test/testmavridiSS.xml' ]);

describe("Unit Tests for Issue of mavridiSS", function(){
  it("1) test for Issue of mavridiSS", function(done){

    var query = mybatisMapper.getStatement('test', 'statement', {'name': "broken'string"}, { language: 'db2', indent: ' ' })
    console.log(query);
    
    done();
  });
});