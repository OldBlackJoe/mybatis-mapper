mybatis-mapper
==============

mybatis-mapper can generate SQL statements from the MyBatis3 Mapper XML file in node.js. You can also use several major Dynamic SQL elements, for example, &lt;if&gt;, &lt;where&gt;, &lt;foreach&gt;.


Installation
============


Usage
=====

1) Parameters ( #{...}, ${...} )
--------------------------------

```javascript
var mybatisMapper = require('../index');
mybatisMapper.createMapper([ './test.xml' ]);

var param = {
    category : 'apple'
}
    
var query = mybatisMapper.getStatement('fruit', 'testStringParameter', param);
console.log(query);
```

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
