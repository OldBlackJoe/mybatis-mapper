var fs = require('fs');
var HTML = require('html-parse-stringify2');
var convert = require('./lib/convert');

var myBatisMapper = {};

function MybatisMapper() {

}

MybatisMapper.prototype.createMapper = function(xmls) {
  const queryTypes = [ 'sql', 'select', 'insert', 'update', 'delete' ];

  // Parse each XML files
  for (var i = 0, xml; xml = xmls[i]; i++) {
    var mappers = HTML.parse(fs.readFileSync(xml).toString());

    for (var j = 0, mapper; mapper = mappers[j]; j++) {
      // Mapping <mapper> tag recursively
      findMapper(mapper);
    }
  }
};

findMapper = function(children) {
  var queryTypes = [ 'sql', 'select', 'insert', 'update', 'delete' ];

  try {
    if (children.type == 'tag' && children.name == 'mapper') {
      // Add Mapper
      myBatisMapper[children.attrs.namespace] = {};

      for (var j = 0, sql; sql = children.children[j]; j++) {
        if (sql['type'] == 'tag' && queryTypes.indexOf(sql['name']) > -1) {
          myBatisMapper[children.attrs.namespace][sql.attrs.id] = sql.children;
        }
      }
      return;
    } else {
      // Recursive to next children
      if (children['children'] != null && children['children'].length > 0) {
        for (var j = 0, nextChildren; nextChildren = children.children[j]; j++) {
          findMapper(nextChildren);
        }
      } else {
        return;
      }
    }
  } catch (err) {
    throw (err);
  }
}

MybatisMapper.prototype.getStatement = function(namespace, sql, param) {
  var statement = '';

  if (namespace == null || myBatisMapper[namespace] == undefined) {
    throw new Error('Namespace Error : [' + namespace + ']');
  }

  if (sql == null || myBatisMapper[namespace][sql] == undefined) {
    throw new Error('SQL ID Error : [' + sql + ']');
  }

  for (var i = 0, children; children = myBatisMapper[namespace][sql][i]; i++) {
    // Convert statement recursively
    statement += convert.convertChildren(children, param);
  }

  statement = convert.convertAfterworks(statement);
  return statement;
};

MybatisMapper.prototype.getMapper = function() {
  return myBatisMapper;
};

module.exports = new MybatisMapper();