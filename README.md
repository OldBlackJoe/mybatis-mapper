# mybatis-mapper #
[![CircleCI](https://circleci.com/gh/OldBlackJoe/mybatis-mapper.svg?style=svg)](https://circleci.com/gh/OldBlackJoe/mybatis-mapper)

mybatis-mapper can generate SQL statements from the MyBatis3 Mapper XML file in node.js. <br>
You can also use Dynamic SQL elements, for example, &lt;if&gt;, &lt;where&gt;, &lt;foreach&gt;.

__Table of contents__

 - [Installation](#installation)
 - [Usage](#usage)
 - [Change Log](#change-log)

## Installation ##

```
npm install --save mybatis-mapper
```

## Usage ##
mybatis-mapper supports all of dynamic SQL elements.<br>
* &lt;if&gt;
* &lt;choose&gt;, &lt;when&gt;, &lt;otherwise&gt;
* &lt;trim&gt;, &lt;where&gt;, &lt;set&gt;
* &lt;foreach&gt;
* &lt;bind&gt;
* &lt;include&gt;

You can see description of Dynamic SQL of MyBatis3 in the link below.<br>
http://www.mybatis.org/mybatis-3/dynamic-sql.html

### 1) Basic ###

First, prepare XML file(s) written in MyBatis3 syntax like below. <br>

#### fruits.xml ####
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
      category = 'apple' AND
      <![CDATA[ price < 500 ]]>
  </select>
</mapper>
```
 - The XML file must have one 'mapper' element, which must have the 'namespace' attribute.
 - mybatis-mapper recognizes and parses the 'select', 'insert', 'update', and 'delete' elements in the 'mapper' element as SQL statements.
 - You can use CDATA section in xml for well-formed XML.
 - other attributes are ignored.
 
Second, writing Node.js codes. <br>

#### fruits.js ####
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
    category : 'apple',
    price : 100
}

// Get SQL Statement
var format = {language: 'sql', indent: '  '};
var query = mybatisMapper.getStatement('fruit', 'testBasic', param, format);

// Do it!
connection.query(query, function(err, results, fields) {
  console.log(results); 
  console.log(fields);
});
```

##### createMapper( [XML Files] ) #####
 - This method takes Array of XML files as a arguments.
 - Reads and parses the specified xml file to prepare the SQL statements.

##### getStatement(Namespace, SqlID, Parameters, format) #####
 - This method takes Namespace, SQL ID, and Parameters as a arguments.
 - Create SQL statement from XML using Parameters and return it. 
 - You can use this SQL string for Node.js MySQL Clients like mysql2. 
 - "format" argument is Optional, it can set the format of the SQL language and indent.<br> For more information, see https://www.npmjs.com/package/sql-formatter

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
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    category : 'apple',
    price : 100
}
    
var query = mybatisMapper.getStatement('fruit', 'testParameters', param, {language: 'sql', indent: '  '});
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

 - As in the example above, if a variable is enclosed in #{ }, the variable is wrapped in quotation marks.
 - The other side, if the variable is enclosed in ${ }, the variable is converted as it is.
 - In general, you can use #{ } for a String variable, and ${ } for a numeric value.

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
        <if test="price >= 400">
          AND name = 'Fuji'
        </if>
      </if>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    category : 'apple',
    price : 500
}

var query = mybatisMapper.getStatement('fruit', 'testIf', param, {language: 'sql', indent: '  '});
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
  1 = 1
  AND category = 'apple'
  AND price = 500
  AND name = 'Fuji'
```

 - You can use dynamic SQL elements repeatedly. for example, &lt;if&gt;&lt;if&gt;&lt;/if&gt;&lt;/if&gt;
 
### 4) &lt;trim&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testTrim">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    <trim prefix="WHERE" prefixOverrides="AND|OR">
        OR category = 'apple'
        OR price = 200
    </trim>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = null;

var query = mybatisMapper.getStatement('fruit', 'testTrim', param, {language: 'sql', indent: '  '});
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
  OR price = 200
```

### 5) &lt;where&gt; element ###

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
        <if test="price != null and price !=''">
          AND price = ${price}
        </if>
        AND
    </where>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    price : 500
}

var query = mybatisMapper.getStatement('fruit', 'testWhere', param, {language: 'sql', indent: '  '});
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
  AND price = 500
```

### 6) &lt;set&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <update id="testSet">
    UPDATE
      fruits
    <set>
      <if test="category != null and category !=''">
        category = #{category},
      </if>
      <if test="price != null and price !=''">
        price = ${price},    
      </if>
    </set>
    WHERE
      name = #{name}
  </update>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    name : 'Fuji',
    category : 'apple',
    price : 300          
}

var query = mybatisMapper.getStatement('fruit', 'testSet', param, {language: 'sql', indent: '  '});
console.log(query);
```

#### result SQL ####
```sql
UPDATE
  fruits
SET
  category = 'apple',
  price = 300
WHERE
  name = 'Fuji'
```

### 6) &lt;choose&gt; &lt;when&gt; &lt;otherwise&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testChoose">
    SELECT
      name,
      category,
      price
    FROM
      fruits 
    <where>
      <choose>
        <when test="name != null">
          AND name = #{name}
        </when>
        <when test="category == 'banana'">
          AND category = #{category}
          <if test="price != null and price !=''">
            AND price = ${price}          
          </if>
        </when>
        <otherwise>
          AND category = 'apple'
        </otherwise>
      </choose>
    </where>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    name : null,
    category : 'banana',
    price : 300
}

var query = mybatisMapper.getStatement('fruit', 'testChoose', param, {language: 'sql', indent: '  '});
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
  category = 'banana'
  AND price = 300
```

### 7) &lt;foreach&gt; element - Basic ###

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
        <if test="name == 'Jonathan' or name == 'Fuji'">
          name = #{name}
        </if>        
      </foreach>
    </where>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    apples : [ 'Jonathan', 'Mcintosh', 'Fuji' ]        
}

var query = mybatisMapper.getStatement('fruit', 'testForeach', param, {language: 'sql', indent: '  '});
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
  AND (
    name = 'Jonathan'
    OR name = 'Fuji'
  )
```

### 8) &lt;foreach&gt; element - Advanced ###

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
var mybatisMapper = require('mybatis-mapper');
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
var query = mybatisMapper.getStatement('fruit', 'testInsertMulti', param, {language: 'sql', indent: '  '});
console.log(query);
```

#### result SQL ####
```sql
INSERT INTO
  fruits (
    name,
    category,
    price
  )
VALUES
  (
    'Jonathan',
    'apple',
    100
  ),
  (
    'Mcintosh',
    'apple',
    500
  )
```

### 10) &lt;bind&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testBind">
    <bind name="likeName" value="'%' + name + '%'"/>
      SELECT
        name,
        category,
        price
      FROM
        fruits 
      WHERE
        name like #{likeName}
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
  name : 'Mc'
}

var query = mybatisMapper.getStatement('fruit', 'testBind', param, {language: 'sql', indent: '  '});
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
  name like '%Mc%'
```

### 11) &lt;include&gt; element ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <sql id="sometable">
    fruits
  </sql>
  
  <sql id="somewhere">
    WHERE
      category = #{category}
  </sql>
  
  <sql id="someinclude">
    FROM
      <include refid="${include_target}"/>
    <include refid="somewhere"/>
  </sql>
  
  <select id="testInclude">
    SELECT
      name,
      category,
      price
    <include refid="someinclude">
      <property name="prefix" value="Some"/>
      <property name="include_target" value="sometable"/>
    </include>
  </select>
</mapper>
```

#### fruits.js ####
```javascript
var mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper([ './fruits.xml' ]);
var param = {
    category : 'apple'
}

var query = mybatisMapper.getStatement('fruit', 'testInclude', param, {language: 'sql', indent: '  '});
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
```

## Change Log ##

### 0.6.6 ###

* Update dependencies for fix issue #13

### 0.6.5 ###

* Fix Unexpected end of input error

### 0.6.4 ###

* Fix JSON data type parsing (arrays/objects)

### 0.6.3 ###

* Fix bug that Null parameter was not converted.

### 0.6.2 ###

* Hot fix for &lt;foreach&gt; element.

### 0.6.1 ###

* Improved parameter conversion logic.
* Bug fix for &lt;trim&gt; &lt;where&gt; elements.

### 0.6.0 ###

* Added typings for use with TypeScript.

### 0.5.3 ###

* Hot fix for &lt;include&gt; element.

### 0.5.2 ###

* Error Handling

### 0.5.1 ###

* Hot fix for &lt;foreach&gt; element.

### 0.5.0 ###

* Support &lt;include&gt; element.
* Do not formatting SQL when 'format' parameter is null
* Bug fix

### 0.4.0 ###

* Support &lt;set&gt; element.
* Support &lt;bind&gt; element.
* SQL formatting using [sql-formatter](https://www.npmjs.com/package/sql-formatter). 
* Bug fix

### 0.3.0 ###

* Support CDATA section
* Bug fix & Error Handling

### 0.2.0 ###

* Change XML parsing library xml2js to [html-parse-stringify2](https://www.npmjs.com/package/html-parse-stringify2).
* Dynamic SQL elements can use repeatedly. for example, &lt;if&gt;&lt;if&gt;&lt;/if&gt;&lt;/if&gt; 
* Support &lt;choose&gt; &lt;when&gt; &lt;otherwise&gt; element.
* Support &lt;trim&gt; element.

### 0.1.0 ###

* Initial Version
