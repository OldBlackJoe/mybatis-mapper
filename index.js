var fs = require('fs');
var HTML = require('html-parse-stringify');
var convert = require('./lib/convert');
var myBatisMapper = {};

function MybatisMapper() {

}

MybatisMapper.prototype.createMapper = function(xmls) {
  const queryTypes = [ 'sql', 'select', 'insert', 'update', 'delete' ];

  // Parse each XML files
  for (var i = 0, xml; xml = xmls[i]; i++) {
    try{
      var rawText = normalizeAttributeSpacing(replaceCdata(fs.readFileSync(xml).toString()));
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

function normalizeAttributeSpacing(rawText) {
  return rawText.replace(/<[^>]+>/g, function(tag) {
    return tag.replace(/([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*/g, '$1=');
  });
}

function stripQuotedText(text) {
  var result = '';
  var quote = null;

  for (var i = 0; i < text.length; i++) {
    var char = text[i];

    if (quote == null) {
      if (char == '\'' || char == '"') {
        quote = char;
      } else {
        result += char;
      }
      continue;
    }

    if (char == '\\') {
      i++;
      continue;
    }

    if (char == quote) {
      if (text[i + 1] == quote) {
        i++;
      } else {
        quote = null;
      }
    }
  }

  return result;
}

function isFormatterCompatibilityError(err) {
  return err != null && err.message != null && (
    err.message.indexOf('Invalid regular expression') > -1 ||
    err.message.indexOf('Object.values(...).flat is not a function') > -1
  );
}

function formatSql(statement, format) {
  try {
    var sqlFormatter = require("sql-formatter");
    return sqlFormatter.format(statement, format);
  } catch (err) {
    if (isFormatterCompatibilityError(err)) {
      throw new Error("SQL formatting requires Node.js 12 or newer. Upgrade Node.js or call getStatement without the format argument.");
    }
    throw err;
  }
}

MybatisMapper.prototype.getStatement = function(namespace, sql, param, format) {
  var statement = '';
  
  // Parameter Check
  if (namespace == null) throw new Error('Namespace should not be null.');
  if (myBatisMapper[namespace] == undefined) throw new Error('Namespace [' + namespace + '] not exists.');
  if (sql == null) throw new Error('SQL ID should not be null.');
  if (myBatisMapper[namespace][sql] == undefined) throw new Error('SQL ID [' + sql + '] not exists');
  
  try{
    for (var i = 0, children; children = myBatisMapper[namespace][sql][i]; i++) {
      // Convert SQL statement recursively
      statement += convert.convertChildren(children, param, namespace, myBatisMapper);
    }
    
    // Check not converted Parameters outside quoted SQL text.
    var statementForCheck = stripQuotedText(statement);
    var regexList = ['\\#{[^}]*}', '\\${[^}]*}'];
    for (var i = 0, regexString; regexString = regexList[i]; i++){
      var regex = new RegExp(regexString, 'g');
      var checkParam = statementForCheck.match(regex);
      
      if (checkParam != null && checkParam.length > 0) {
        throw new Error("Parameter " + checkParam.join(",") + " is not converted.");
      }
    }

    // SQL formatting
    if (format != undefined && format != null){
      statement = formatSql(statement, format);
    }
  } catch (err) {
    throw err
  }
  
  return statement;
};

MybatisMapper.prototype.getMapper = function() {
  return myBatisMapper;
};

module.exports = new MybatisMapper();
