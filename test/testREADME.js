var assert = require('assert');
var mybatisMapper = require('../index');

mybatisMapper.createMapper([ './test/testREADME.xml' ]);

function assertSql(actual, expected) {
  assert.equal(actual, expected.trim());
}

describe("Unit Tests in README.md", function() {
  it("1) Basic", function(done) {
    var param = {
      category : 'apple',
      price : 100
    };

    var query = mybatisMapper.getStatement('fruit', 'testBasic', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
  and price < 500
`);
    done();
  });

  it("2) Parameters ( #{...}, ${...} )", function(done) {
    var param = {
      category : 'apple',
      price : 100
    };

    var query = mybatisMapper.getStatement('fruit', 'testParameters', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
  AND price > 100
`);
    done();
  });

  it("3) <if> element", function(done) {
    var param = {
      category : 'apple',
      price : 500
    };

    var query = mybatisMapper.getStatement('fruit', 'testIf', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  1 = 1
  AND price = 500
  AND name = 'Fuji'
`);
    done();
  });

  it("4) <trim> element", function(done) {
    var query = mybatisMapper.getStatement('fruit', 'testTrim', null, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
  OR price = 200
`);
    done();
  });

  it("5) <where> element", function(done) {
    var param = {
      price : 500
    };

    var query = mybatisMapper.getStatement('fruit', 'testWhere', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
  AND price = 500
`);
    done();
  });

  it("6) <set> element", function(done) {
    var param = {
      name : 'Fuji',
      category : 'apple',
      price : 300
    };

    var query = mybatisMapper.getStatement('fruit', 'testSet', param, {language: 'sql', indent: '  '});

    assertSql(query, `
UPDATE fruits
SET
  category = 'apple',
  price = 300
WHERE
  name = 'Fuji'
`);
    done();
  });

  it("7) <choose> <when> <otherwise> elements", function(done) {
    var param = {
      name : null,
      category : 'banana',
      price : 300
    };

    var query = mybatisMapper.getStatement('fruit', 'testChoose', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'banana'
  AND price = 300
`);
    done();
  });

  it("8) <foreach> element - Basic", function(done) {
    var param = {
      apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]
    };

    var query = mybatisMapper.getStatement('fruit', 'testForeach', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
  AND (
    name = 'Jonathan'
    OR name = 'Fuji'
  )
`);
    assert.equal(query.indexOf("Mcintosh"), -1);
    done();
  });

  it("9) <foreach> element - Advanced", function(done) {
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
    };

    var query = mybatisMapper.getStatement('fruit', 'testInsertMulti', param, {language: 'sql', indent: '  '});

    assertSql(query, `
INSERT INTO
  fruits (name, category, price)
VALUES
  ('Jonathan', 'apple', 100),
  ('Mcintosh', 'apple', 500)
`);
    done();
  });

  it("10) test <bind>", function(done) {
    var param = {
      name : 'Mc'
    };

    var query = mybatisMapper.getStatement('fruit', 'testBind', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  name like '\\%Mc\\%'
`);
    done();
  });

  it("11) test <include>", function(done) {
    var param = {
      category : 'apple'
    };

    var query = mybatisMapper.getStatement('fruit', 'testInclude', param, {language: 'sql', indent: '  '});

    assertSql(query, `
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
`);
    done();
  });
});
