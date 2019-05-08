var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test/testREADME.xml' ]);

describe("Unit Tests in README.md", function() {
  it("1) Basic", function(done) {
    // SQL Parameters
    var param = {
      category : 'apple',
      price : 100
    }

    // Get SQL Statement
    var format = {language: 'sql', indent: '  '};
    var query = mybatisMapper.getStatement('fruit', 'testBasic', param, format);
    console.log(query);

    done();
  });

  it("2) Parameters ( #{...}, ${...} )", function(done) {
    var param = {
      category : 'apple',
      price : 100
    }

    var query = mybatisMapper.getStatement('fruit', 'testParameters', param, {language: 'sql', indent: '  '});
    console.log(query);

    done();
  });
  
  it("3) <if> element", function(done){
    var param = {
        category : 'apple',
        price : 500
    }

    var query = mybatisMapper.getStatement('fruit', 'testIf', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });  

  it("4) <trim> element", function(done){
    var param = null;
    
    var query = mybatisMapper.getStatement('fruit', 'testTrim', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });
  
  it("5) <where> element", function(done){
    var param = {
        price : 500
    }

    var query = mybatisMapper.getStatement('fruit', 'testWhere', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });

  it("6) <set> element", function(done){
    var param = {
        name : 'Fuji',
        category : 'apple',
        price : 300          
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testSet', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });
  
  it("7) <choose> <when> <otherwise> elements", function(done){
    var param = {
        name : null,
        category : 'banana',
        price : 300
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testChoose', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });
  
  it("8) <foreach> element - Basic", function(done){
    var param = {
        apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]        
    }

    var query = mybatisMapper.getStatement('fruit', 'testForeach', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });
  
  it("9) <foreach> element - Advanced", function(done){
    var param = {
        fruits : [
          {
            name : 'Jonathan',
            category : 'apple',
            price : 100        
          },
          {
            name : 'Mcintosh',
            category : 'apple',
            price : 500
          }
        ]
      }
      var query = mybatisMapper.getStatement('fruit', 'testInsertMulti', param, {language: 'sql', indent: '  '});
      console.log(query);
    
    done();
  });
  
  it("10) test <bind>", function(done){
    var param = {
      name : 'Mc'
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testBind', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });
  
  it("11) test <include>", function(done){
    var param = {
        category : 'apple'
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testInclude', param, {language: 'sql', indent: '  '});
    console.log(query);
    
    done();
  });
});
