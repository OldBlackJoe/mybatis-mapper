# mybatis-mapper

[![npm version](https://img.shields.io/npm/v/mybatis-mapper.svg)](https://www.npmjs.com/package/mybatis-mapper)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/OldBlackJoe/mybatis-mapper/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/OldBlackJoe/mybatis-mapper/tree/master)
[![License](https://img.shields.io/npm/l/mybatis-mapper.svg)](LICENSE)

Generate SQL strings from MyBatis 3 mapper XML files in Node.js.

`mybatis-mapper` reads mapper XML, evaluates supported MyBatis dynamic SQL tags, replaces parameters, and optionally formats the generated SQL with `sql-formatter`.

## Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Supported Mapper Syntax](#supported-mapper-syntax)
- [Parameters](#parameters)
- [Dynamic SQL Examples](#dynamic-sql-examples)
- [Formatting](#formatting)
- [API](#api)
- [TypeScript](#typescript)
- [Safety Notes](#safety-notes)
- [Development](#development)
- [Recent Changes](#recent-changes)

## Installation

```sh
npm install mybatis-mapper
```

Node.js `>=12` is supported. CI currently runs on Node.js 20.

## Quick Start

Create a mapper XML file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="fruit">
  <select id="findByCategory">
    SELECT
      name,
      category,
      price
    FROM
      fruits
    WHERE
      category = #{category}
      AND price &lt; ${maxPrice}
  </select>
</mapper>
```

Load it and build a statement:

```js
const mybatisMapper = require('mybatis-mapper');

mybatisMapper.createMapper(['./fruits.xml']);

const sql = mybatisMapper.getStatement(
  'fruit',
  'findByCategory',
  {
    category: 'apple',
    maxPrice: 500
  },
  {
    language: 'sql',
    indent: '  '
  }
);

console.log(sql);
```

Result:

```sql
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  category = 'apple'
  AND price < 500
```

The returned value is a SQL string. You can pass it to a database client such as `mysql2`, `pg`, or another driver that accepts SQL text.

## Supported Mapper Syntax

Mapper files must contain a `mapper` element with a `namespace` attribute.

The following statement and fragment tags are recognized:

- `select`
- `insert`
- `update`
- `delete`
- `sql`

The following dynamic SQL tags are supported:

- `if`
- `choose`, `when`, `otherwise`
- `trim`, `where`, `set`
- `foreach`
- `bind`
- `include`

CDATA sections are supported. Use CDATA when XML would otherwise reject SQL operators such as `<`, `>`, or `&`.

```xml
<select id="findCheap">
  SELECT * FROM fruits
  WHERE <![CDATA[ price < 500 ]]>
</select>
```

## Parameters

Use `#{...}` when a value should be quoted and escaped:

```xml
WHERE category = #{category}
```

```js
mybatisMapper.getStatement('fruit', 'find', { category: 'apple' }, null);
```

Output:

```sql
WHERE category = 'apple'
```

Use `${...}` when a value should be inserted as raw SQL text:

```xml
WHERE price > ${minPrice}
```

```sql
WHERE price > 100
```

Parameter behavior:

- `#{name}` wraps non-null values in single quotes.
- Single quotes in `#{name}` values are escaped by doubling them.
- `null` becomes `NULL`.
- Arrays and objects used with `#{name}` are converted with `JSON.stringify`.
- Nested paths such as `#{fruit.name}` and `${fruit.price}` are supported.
- Unresolved placeholders outside SQL string literals throw an error.
- Placeholder-looking text inside quoted SQL literals, such as `'#{notParam}'`, is left alone when no matching parameter exists.

## Dynamic SQL Examples

### `if` and `where`

```xml
<select id="search">
  SELECT name, category, price
  FROM fruits
  <where>
    <if test="category != null and category != ''">
      AND category = #{category}
    </if>
    <if test="maxPrice != null">
      AND price &lt; ${maxPrice}
    </if>
  </where>
</select>
```

```js
mybatisMapper.getStatement('fruit', 'search', {
  category: 'apple',
  maxPrice: 500
}, { language: 'sql' });
```

### `choose`, `when`, and `otherwise`

```xml
<select id="chooseExample">
  SELECT name, category, price
  FROM fruits
  <where>
    <choose>
      <when test="name != null">
        AND name = #{name}
      </when>
      <when test="category == 'banana'">
        AND category = #{category}
      </when>
      <otherwise>
        AND category = 'apple'
      </otherwise>
    </choose>
  </where>
</select>
```

### `foreach`

```xml
<select id="findByNames">
  SELECT name, category, price
  FROM fruits
  <where>
    <foreach collection="names" item="name" open="name IN (" close=")" separator=",">
      #{name}
    </foreach>
  </where>
</select>
```

```js
mybatisMapper.getStatement('fruit', 'findByNames', {
  names: ['Jonathan', 'Fuji']
}, { language: 'sql' });
```

Result:

```sql
SELECT
  name,
  category,
  price
FROM
  fruits
WHERE
  name IN ('Jonathan', 'Fuji')
```

`foreach` also supports an `index` attribute:

```xml
<foreach collection="names" item="name" index="idx" separator=",">
  #{idx}:#{name}
</foreach>
```

### `bind`

```xml
<select id="findLike">
  <bind name="likeName" value="'%' + name + '%'"/>
  SELECT name, category, price
  FROM fruits
  WHERE name LIKE #{likeName}
</select>
```

### `include`

```xml
<sql id="tableName">
  fruits
</sql>

<sql id="categoryWhere">
  WHERE category = #{category}
</sql>

<select id="findWithInclude">
  SELECT name, category, price
  FROM <include refid="tableName"/>
  <include refid="categoryWhere"/>
</select>
```

`include` supports `property` values and parameterized `refid` values:

```xml
<include refid="${fragmentName}">
  <property name="fragmentName" value="categoryWhere"/>
</include>
```

### `equalsIgnoreCase`

MyBatis-style case-insensitive checks are supported in `if` tests:

```xml
<if test='"PAGE1".equalsIgnoreCase(page)'>
  AND name = #{page_size}
</if>
```

## Formatting

The fourth argument to `getStatement` is passed to `sql-formatter`.

```js
const sql = mybatisMapper.getStatement(
  'fruit',
  'search',
  { category: 'apple' },
  {
    language: 'mysql',
    keywordCase: 'lower',
    indent: '  '
  }
);
```

Common options include:

- `language`: `sql`, `mysql`, `db2`, `postgresql`, `sqlite`, `mariadb`, and other languages supported by `sql-formatter`
- `indent`: string used for indentation
- `keywordCase`: `preserve`, `upper`, or `lower`

Pass `null` or omit the fourth argument to skip formatting:

```js
const sql = mybatisMapper.getStatement('fruit', 'search', params, null);
```

## API

### `createMapper(xmlFiles)`

Reads one or more mapper XML files and stores their statements by namespace.

```js
mybatisMapper.createMapper([
  './mappers/fruits.xml',
  './mappers/orders.xml'
]);
```

Calling `createMapper` more than once adds to the in-memory mapper registry. Existing namespaces are reused.

### `getStatement(namespace, statementId, params, format)`

Builds a SQL string from a mapped statement.

```js
const sql = mybatisMapper.getStatement(
  'fruit',
  'findByCategory',
  { category: 'apple' },
  { language: 'sql' }
);
```

Arguments:

- `namespace`: mapper namespace, for example `fruit`
- `statementId`: statement or SQL fragment id
- `params`: plain object with parameter values, or `null`
- `format`: optional `sql-formatter` options, or `null`

Throws when:

- the namespace is missing
- the statement id is missing
- params is not a plain object or `null`
- a placeholder outside quoted SQL text cannot be converted
- the XML contains unsupported markup in a statement body

### `getMapper()`

Returns the current in-memory mapper registry.

```js
const mapper = mybatisMapper.getMapper();
```

## TypeScript

Type definitions are included.

```ts
import mybatisMapper = require('mybatis-mapper');

mybatisMapper.createMapper(['./fruits.xml']);

const sql: string = mybatisMapper.getStatement(
  'fruit',
  'findByCategory',
  { category: 'apple' },
  { language: 'sql' }
);
```

## Safety Notes

`mybatis-mapper` produces an interpolated SQL string, not a prepared statement.

Prefer `#{...}` for values. It quotes and escapes common string characters before inserting them into the SQL string.

Use `${...}` only for trusted SQL fragments, identifiers, or numeric values you have already validated. Raw interpolation can create SQL injection vulnerabilities if user input is passed through unchecked.

Mapper XML should be application-controlled. Do not evaluate mapper files supplied by untrusted users.

## Development

Install dependencies:

```sh
npm ci
```

Run tests:

```sh
npm test
```

Run a security audit:

```sh
npm audit --audit-level=low
```

The test suite uses the Node.js built-in test runner and runs in CircleCI with Node.js 20.

## Recent Changes

### 0.8.1

- Removed vulnerable development dependency chain by switching tests to the Node.js built-in test runner.
- Updated CircleCI to config `2.1`.
- Pinned the CircleCI Node image to a valid Node 20 tag.

### 0.8.0

- Fixed compatibility with `sql-formatter` placeholder handling.
- Fixed mapper parsing helpers so nested mapper lookup works reliably.
- Added support for `equalsIgnoreCase` in dynamic `if` expressions.

See [CHANGELOG.md](CHANGELOG.md) for older release history.
