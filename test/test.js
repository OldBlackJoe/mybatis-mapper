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
  
  it("4) <trim> elements", function(done){
    var param = null;
    
    var query = mybatisMapper.getStatement('fruit', 'testTrim', param);
    console.log(query);
    
    done();
  });
  
  it("5) <where> elements", function(done){
    var param = null;
    
    var query = mybatisMapper.getStatement('fruit', 'testWhere', param);
    console.log(query);
    
    done();
  });
  
  it("6) <choose> <when> <otherwise> elements", function(done){
    var param = {
        name : null,
        category : 'banana',
        price : 500
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testChoose', param);
    console.log(query);
    
    done();
  });
  
  it("7) <foreach> elements", function(done){
    var param = {
        apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]        
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testForeach', param);
    console.log(query);
    
    done();
  });
  
  it("8) <insert> elements : Simple Insert", function(done){
    var param = {
        name : 'Jonathan',
        category : 'apple',
        price : 100
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testInsert', param);
    console.log(query);
    
    done();
  });
  
  it("9) <insert> elements : Multiline Insert", function(done){
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

  it("10) <if> elements in <foreach>", function(done){
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

  it("11) <if> inside <if>", function(done){
    var param = {
        name : 'Mcintosh',
        category : 'apple',
        price : 500
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testIfInsideIf', param);
    console.log(query);
    
    done();
  });

  it("12) test <![CDATA[  ]]>", function(done){
    var param = null;
    
    var query = mybatisMapper.getStatement('fruit', 'testCdata', param);
    console.log(query);
    
    done();
  });
  
  it("13) test <bind>", function(done){
    var param = {
        name : 'Mc',
    }
    
    var query = mybatisMapper.getStatement('fruit', 'testBind', param);
    console.log(query);
    
    done();
  });
});
