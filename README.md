## mybatis-mapper ##

mybatis-mapper can generate SQL statements from the MyBatis3 Mapper XML file in node.js. <br>
You can also use several major Dynamic SQL elements, for example, &lt;if&gt;, &lt;where&gt;, &lt;foreach&gt;.

__Table of contents__

  - [Installation](#installation)
  - [Usage](#usage)
  - [Future Goal](#future-goal)

## Installation ##

TBD

## Usage ##
You can see description of Dynamic SQL of MyBatis3 in the link below. <br>
http://www.mybatis.org/mybatis-3/dynamic-sql.html

### 1) Basic ###

First, prepare XML file(s) written in MyBatis3 syntax like below. <br>
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testBasic">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    WHERE
      category = 'apple'
  </select>
</mapper>
```
 - The XML file must have one 'mapper' element, which must have the 'namespace' attribute.
 - mybatis-mapper recognizes and parses the 'select', 'insert', 'update', and 'delete' elements in the 'mapper' element as SQL statements.
 - You do not need to use CDATA section in xml.
 - Sadly, other properties are ignored in the current version.
 
Second, writing Node.js codes. <br>
```javascript
const mysql = require('mysql2');
const mybatisMapper = require('mybatis-mapper');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});

// create the myBatisMapper from xml file
mybatisMapper.createMapper([ './fruits.xml' ]);

// SQL Parameters
var param = {
    category : 'apple'
    param : 100
}

// Get SQL Statement
var query = mybatisMapper.getStatement('fruit', 'testParameters', param);

// Do it!
connection.query(query, function(err, results, fields) {
  console.log(results); 
  console.log(fields);
});
```

 - createMapper( [XML Files] ) : This method takes Array of XML files as a arguments. <br> Reads and parses the specified xml file to prepare the SQL statements.
 - getStatement(Namespace, SqlID, Parameters) : This method takes Namespace, SQL ID, and Parameters as a arguments. <br> Create SQL statement from XML using Parameters and return it. <br> You can use this SQL string for Node.js MySQL Clients like mysql2.

### 2) Parameters ( #{...}, ${...} ) ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testParameters">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    WHERE
      category = #{category}
      AND price > ${price}
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    category : 'apple'
    param : 100
}
    
var query = mybatisMapper.getStatement('fruit', 'testParameters', param);
console.log(query);
```

#### result SQL ####
```sql
SELECT
  name,
  category,
  price
FROM
  fruits 
WHERE
  category = 'apple'
  AND price > 100
```

As in the example above, if a variable is enclosed in #{ }, the variable is wrapped in quotation marks. <br>
The other side, if the variable is enclosed in ${ }, the variable is converted as it is. <br>
In general, you can use #{ } for a String variable, and ${ } for a numeric value. <br>

### 3) &lt;if&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testIf">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    WHERE
      1=1
      <if test="category != null and category !=''">
        AND category = #{category}
      </if>
      <if test="price != null and price !=''">
        AND price = ${price}
      </if>
      <if test="category == 'apple' and price >= 400">
        AND name = 'Fuji'
      </if>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    category : 'apple',
    price : 500
}

var query = mybatisMapper.getStatement('fruit', 'testIf', param);
console.log(query);
```

#### result SQL ####
```sql
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  1=1
    AND category = 'apple'
    AND price = 500
    AND name = 'Fuji'
```

### 4) &lt;where&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testWhere">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    <where>
        AND category = 'apple'
        OR price = 200
        AND
    </where>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = null;

var query = mybatisMapper.getStatement('fruit', 'testWhere', param);
console.log(query);
```

#### result SQL ####
```sql
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE  category = 'apple'
    OR price = 200
```

### 5) &lt;foreach&gt; element - Basic ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testForeach">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    <where>
      category = 'apple' AND
      <foreach collection="apples" item="name"  open="(" close=")" separator="OR">
        name = #{name}
      </foreach>
    </where>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]        
}

var query = mybatisMapper.getStatement('fruit', 'testForeach', param);
console.log(query);
```

#### result SQL ####
```sql
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple' AND
  (
    name = "Jonathan"
  OR
    name = "Mcintosh"
  OR
    name = "Fuji"
  )
```

### 6) &lt;foreach&gt; element - Advanced ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <insert id="testInsertMulti">
    INSERT INTO
      fruits
    (
      name,
      category,
      price      
    )
    VALUES
    <foreach collection="fruits" item="fruit"  separator=",">
    (
      #{fruit.name},
      #{fruit.category},
      ${fruit.price}
    )
    </foreach>
  </insert>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './fruits.xml' ]);
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
```

#### result SQL ####
```sql
INSERT INTO
  fruits
(
  name,
  category,
  price
)
VALUES
(
  "Jonathan",
  "apple",
  100
)
,
(
  "Mcintosh",
  "apple",
  500
)
```

## Future goal ##

TBD
