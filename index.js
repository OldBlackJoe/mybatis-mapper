var fs = require('fs');
var xml2js = require('xml2js');
var dynamics = require('./lib/dynamics');
var conceal = require('./lib/conceal');

var myBatisMapper = {};

function MybatisMapper() {
  
}

MybatisMapper.prototype.createMapper = function(mappers) {
  var queryTypes = [ 'select', 'insert', 'update', 'delete' ];

  for (var i = 0, mapper; mapper = mappers[i]; i++) {
    var data = fs.readFileSync(mapper).toString();
    
    data = conceal.concealIf(data);
    data = conceal.concealForeach(data);
    data = conceal.concealWhere(data);
    data = conceal.concealLt(data);
    data = conceal.concealLte(data);
    data = conceal.concealGt(data);
    data = conceal.concealGte(data);

    var parser = new xml2js.Parser();
    parser.parseString(data, function(err, result) {
      var namespace = result.mapper.$.namespace;
      myBatisMapper[namespace] = {};

      for (var k=0, queryType; queryType=queryTypes[k]; k++) {
        if (queryType in result.mapper) {
          for (var j=0, sql; sql=result.mapper[queryType][j]; j++) {
            myBatisMapper[namespace][sql.$.id] = sql._;
          }
        }
      }
    });
  }
};

MybatisMapper.prototype.getStatement = function(namespace, sql, param) {
  var copyMapper = myBatisMapper[namespace][sql];

  copyMapper = dynamics.convertIf(copyMapper, param);
  copyMapper = dynamics.convertWhere(copyMapper);
  copyMapper = dynamics.convertForeach(copyMapper);

  if (param !== null) {
    if (Object.keys(param).length != 0) {
      // Convert #{...}
      for ( var key in param) {
        if (param[key] == null || param[key] == undefined) {
          var reg = new RegExp("\\#{" + key + "}", "g");
          var tempParamKey = ("NULL")
          // tempParamKey = tempParamKey.replace(/'/g, "\\\'");
          copyMapper = copyMapper.replace(reg, tempParamKey);
        } else {
          var reg = new RegExp("#{" + key + "}", "g");
          var tempParamKey = (param[key] + "").replace(/"/g, "\\\"");
          tempParamKey = tempParamKey.replace(/'/g, "\\\'");
          copyMapper = copyMapper.replace(reg, "'" + tempParamKey + "'");
        }
      }

      // Convert ${...}
      for ( var key in param) {
        var reg = new RegExp("\\${" + key + "}", "g");
        var tempParamKey = (param[key] + "")
        // tempParamKey = tempParamKey.replace(/'/g, "\\\'");
        copyMapper = copyMapper.replace(reg, tempParamKey);
      }
    }
  }

  if ((/#{.*?}/g).test(copyMapper)) {
    throw new Error("Parameter failure " + copyMapper.match(/#{.*?}/g));
  }

  if ((/\${.*?}/g).test(copyMapper)) {
    throw new Error("Parameter failure " + copyMapper.match(/${.*?}/g));
  }

  // Remove comma(,) before WHERE
  var regex = new RegExp("(,)([\\s]*?)(where)", "gi");
  copyMapper = copyMapper.replace(regex, " WHERE ");

  // Remove comma(,) after SET
  regex = new RegExp("(set)([\\s]*?)(,)", "gi");
  copyMapper = copyMapper.replace(regex, " SET ");

  // Convert < > <= >=
  copyMapper = copyMapper.replace(/(@lt@)/g, "<");
  copyMapper = copyMapper.replace(/(@gt@)/g, ">");
  copyMapper = copyMapper.replace(/(@lte@)/g, "<=");
  copyMapper = copyMapper.replace(/(@gte@)/g, ">=");

  copyMapper = copyMapper.toString();

  return copyMapper;
};

MybatisMapper.prototype.getMapper = function() {
  return myBatisMapper;
};

module.exports = new MybatisMapper();