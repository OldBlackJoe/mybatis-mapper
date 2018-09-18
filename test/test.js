var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test.xml' ]);

describe("Query tests with parameters", function(){
  it("1) #{...} parameters", function(done){
    var param = {
        category : 'apple'
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testStringParameter', param);
    console.log(query);
    
    done();
  });

  it("2) ${...} parameters", function(done){
    var param = {
        category : 'apple',
        price : 300
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testIntegerParameter', param);
    console.log(query);
    
    done();
  });
  
  it("3) <if test=''> elements", function(done){
    var param = {
        category : 'apple',
        price : 500
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testIf', param);
    console.log(query);
    
    done();
  });
  
  it("4) <where> elements", function(done){
    var param = null;
    
    var query = mybatisMapper.getStatement('fruit', 'testWhere', param);
    console.log(query);
    
    done();
  });
  
  it("5) <foreach> elements", function(done){
    var param = {
        apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]        
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testForeach', param);
    console.log(query);
    
    done();
  });
  
  it("6) <insert> elements : Simple Insert", function(done){
    var param = {
        name : 'Jonathan',
        category : 'apple',
        price : 100
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testInsert', param);
    console.log(query);
    
    done();
  });
  
  it("7) <insert> elements : Multiline Insert", function(done){
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
        },
        {
          name : 'Fuji',
          category : 'apple',
          price : 300
        }      
      ]
    }
    var query = mybatisMapper.getStatement('fruit', 'testInsertMulti', param);
    console.log(query);
    done();
  });

  it("8) Test <if> elements in <foreach>", function(done){
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
        },
        {
          name : 'Morado',
          category : 'banana',
          price : 300
        }      
      ]
    }
    var query = mybatisMapper.getStatement('fruit', 'testForeachIf', param);
    console.log(query);
    done();
  });

  it("9) <if> inside <if>", function(done){
    var param = {
        name : 'Mcintosh',
        category : 'apple',
        price : 500
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testIfInsideIf', param);
    console.log(query);
    
    done();
  });
});
