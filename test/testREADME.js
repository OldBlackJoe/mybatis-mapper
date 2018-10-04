var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './testREADME.xml' ]);

describe("Query tests with parameters", function() {
  it("1) Basic", function(done) {
    // SQL Parameters
    var param = {
      category : 'apple',
      price : 100
    }

    // Get SQL Statement
    var query = mybatisMapper.getStatement('fruit', 'testBasic', param);
    console.log(query);

    done();
  });

  it("2) Parameters ( #{...}, ${...} )", function(done) {
    var param = {
      category : 'apple',
      price : 100
    }

    var query = mybatisMapper.getStatement('fruit', 'testParameters', param);
    console.log(query);

    done();
  });
  
  it("3) <if> element", function(done){
    var param = {
        category : 'apple',
        price : 500
    }

    var query = mybatisMapper.getStatement('fruit', 'testIf', param);
    console.log(query);
    
    done();
  });  

  it("4) <trim> element", function(done){
    var param = null;
    
    var query = mybatisMapper.getStatement('fruit', 'testTrim', param);
    console.log(query);
    
    done();
  });
  
  it("5) <where> element", function(done){
    var param = {
        price : 500
    }

    var query = mybatisMapper.getStatement('fruit', 'testWhere', param);
    console.log(query);
    
    done();
  });

  it("6) <set> element", function(done){
    var param = {
        name : 'Fuji',
        category : 'apple',
        price : 300          
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testSet', param);
    console.log(query);
    
    done();
  });
  
  it("7) <choose> <when> <otherwise> elements", function(done){
    var param = {
        name : null,
        category : 'banana',
        price : 300
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testChoose', param);
    console.log(query);
    
    done();
  });
  
  it("8) <foreach> element - Basic", function(done){
    var param = {
        apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]        
    }

    var query = mybatisMapper.getStatement('fruit', 'testForeach', param);
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
      var query = mybatisMapper.getStatement('fruit', 'testInsertMulti', param);
      console.log(query);
    
    done();
  });
  
  it("10) test <bind>", function(done){
    var param = {
      name : 'Mc'
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testBind', param);
    console.log(query);
    
    done();
  });
});