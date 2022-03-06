var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test/testnusgnojkrap.xml' ]);

describe("Unit Tests for Mybatis-mapper", function(){
  it("1) #{...} parameters", function(done){
    var param = {}
    
    var query = mybatisMapper.getStatement('errorexample', 'errorSql', param);
    console.log(query);
    
    done();
  });
});