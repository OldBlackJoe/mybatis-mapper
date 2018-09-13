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
    var fruits = [
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
        
    var query = mybatisMapper.getStatement('fruit', 'testInsertHeader', null);
    
    var insertRows = [];
    for (var i=0; i<fruits.length; i++){
      insertRows.push(mybatisMapper.getStatement('fruit', 'testInsertRows', fruits[i]));
    }
    
    query += insertRows.join(",");
    console.log(query);
    
    done();
  });  
});
