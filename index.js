var fs = require('fs');
var xml2js = require('xml2js');
var dynamics = require('./lib/dynamics');
var conceal = require('./lib/conceal');

var myBatisMapper = {};
var parser = new xml2js.Parser();

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
    
    parser.parseString(data, function(err, result) {
      var namespace = result.mapper.$.namespace;
      myBatisMapper[namespace] = {};

      for (var k = 0, queryType; queryType = queryTypes[k]; k++) {
        if (queryType in result.mapper) {
          for (var j = 0, sql; sql = result.mapper[queryType][j]; j++) {
            myBatisMapper[namespace][sql.$.id] = sql._;
          }
        }
      }
    });
  }
};

MybatisMapper.prototype.getStatement = function(namespace, sql, param) {
  var copyMapper = myBatisMapper[namespace][sql];

  // Convert < > <= >=
  copyMapper = copyMapper.replace(/(@lt@)/g, "<");
  copyMapper = copyMapper.replace(/(@gt@)/g, ">");
  copyMapper = copyMapper.replace(/(@lte@)/g, "<=");
  copyMapper = copyMapper.replace(/(@gte@)/g, ">=");
  
  copyMapper = dynamics.convertIf(copyMapper, param);
  copyMapper = dynamics.convertWhere(copyMapper);
  copyMapper = dynamics.convertForeach(copyMapper, param);

  copyMapper = dynamics.convertParameters(copyMapper, param);
  copyMapper = dynamics.convertAfterworks(copyMapper);
  copyMapper = copyMapper.toString();

  return copyMapper;
};

MybatisMapper.prototype.getMapper = function() {
  return myBatisMapper;
};

module.exports = new MybatisMapper();