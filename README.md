## mybatis-mapper ##

mybatis-mapper can generate SQL statements from the MyBatis3 Mapper XML file in node.js. You can also use several major Dynamic SQL elements, for example, &lt;if&gt;, &lt;where&gt;, &lt;foreach&gt;.


## Installation ##

TBD

## Usage ##

### 1) Parameters ( #{...}, ${...} ) ###

#### fruits.xml ####
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">  
  <select id="testStringParameter">
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
mybatisMapper.createMapper([ './test.xml' ]);

var param = {
    category : 'apple'
    param : 100
}
    
var query = mybatisMapper.getStatement('fruit', 'testStringParameter', param);
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
