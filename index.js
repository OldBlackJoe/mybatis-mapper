var fs = require('fs');
var HTML = require('html-parse-stringify');
var sqlFormatter = require("sql-formatter");
var convert = require('./lib/convert');
var myBatisMapper = {};

function MybatisMapper() {

}

MybatisMapper.prototype.createMapper = function(xmls) {
  const queryTypes = [ 'sql', 'select', 'insert', 'update', 'delete' ];

  // Parse each XML files
  for (var i = 0, xml; xml = xmls[i]; i++) {
    try{
      var rawText = replaceCdata(fs.readFileSync(xml).toString());     
      var mappers = HTML.parse(rawText);
    } catch (err){
			throw new Error("Error occured during open XML file [" + xml + "]");
    }
    
    try{
      for (var j = 0, mapper; mapper = mappers[j]; j++) {
        // Mapping <mapper> tag recursively
        findMapper(mapper);
      }
    } catch (err) {
      throw new Error("Error occured during parse XML file [" + xml + "]");
    }
  }
};

function findMapper(children) {
  var queryTypes = [ 'sql', 'select', 'insert', 'update', 'delete' ];

  if (children.type == 'tag' && children.name == 'mapper') {
    // Add Mapper
    if(!myBatisMapper[children.attrs.namespace]) {
      myBatisMapper[children.attrs.namespace] = {};
    }

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
}

function replaceCdata(rawText) {
  var cdataRegex = new RegExp('(<!\\[CDATA\\[)([\\s\\S]*?)(\\]\\]>)', 'g');
  var matches = rawText.match(cdataRegex);
  
  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      var regex = new RegExp('(<!\\[CDATA\\[)([\\s\\S]*?)(\\]\\]>)', 'g');
      var m = regex.exec(matches[z]);

      var cdataText = m[2];
      cdataText = cdataText.replace(/\&/g,'&amp;');
      cdataText = cdataText.replace(/\</g,'&lt;');
      cdataText = cdataText.replace(/\>/g,'&gt;');
      cdataText = cdataText.replace(/\"/g,'&quot;');
      
      rawText = rawText.replace(m[0], cdataText);
    }
  }
  
  return rawText;
}

function stripQuoted(text) {
  return text.replace(/(["'])(?:\\.|[^\\])*?\1/g, '');
}

MybatisMapper.prototype.getStatement = function (namespace, sql, param, format) {
  var statement = '';

  if (!namespace) throw new Error('Namespace should not be null.');
  if (!myBatisMapper[namespace]) throw new Error(`Namespace [${namespace}] not exists.`);
  if (!sql) throw new Error('SQL ID should not be null.');
  if (!myBatisMapper[namespace][sql]) throw new Error(`SQL ID [${sql}] not exists`);

  for (var i = 0, node; (node = myBatisMapper[namespace][sql][i]); i++) {
    statement += convert.convertChildren(node, param, namespace, myBatisMapper);
  }

  var bodyForCheck = stripQuoted(statement);

  ['#\\{\\S+?\\}', '\\$\\{\\S+?\\}'].forEach((pattern) => {
    var re = new RegExp(pattern, 'g');
    var leftovers = bodyForCheck.match(re);
    if (leftovers && leftovers.length) {
      throw new Error(`Parameter ${leftovers.join(',')} is not converted.`);
    }
  });

  if (format) {
    statement = sqlFormatter.format(statement, format);
  }

  return statement;
};

MybatisMapper.prototype.getMapper = function() {
  return myBatisMapper;
};

module.exports = new MybatisMapper();