var convertChildren = function(children, param) {
  if (children.type == 'text') {
    // Convert Parameters
    return convertParameters(children, param);

  } else if (children.type == 'tag') {
    switch (children.name.toLowerCase()) {
    case 'where':
      return convertWhere(children, param);
      break;
    case 'foreach':
      return convertForeach(children, param);
      break;
    case 'if':
      return convertIf(children, param);
      break;
    }
  } else {
    return '';
  }
}

var convertParameters = function(children, param) {
  var tempString = children.content;

  var keyString = '';  
  if (param !== null && Object.keys(param).length != 0) {
    tempString = recursiveParameters(tempString, param, keyString);
  }
  
  return tempString;
}

var recursiveParameters = function(tempString, param, keyString) {
  var keyDict = Object.keys(param);  
  
  for (var i=0, key; key=keyDict[i]; i++) {
    if (isDict(param[key])){
      var nextKeyString = keyString + key + '\\.';
      tempString = recursiveParameters(tempString, param[key], nextKeyString);
    } else {
      if (param[key] == null || param[key] == undefined) {
        var reg = new RegExp('\\#{' + (keyString + key) + '}', 'g');
        
        var tempParamKey = ('NULL')
        tempString = tempString.replace(reg, tempParamKey);
      } else {
        var reg = new RegExp('\\#{' + (keyString + key) + '}', 'g');

        var tempParamKey = (param[key] + '').replace(/"/g, '\\\"');
        tempParamKey = tempParamKey.replace(/'/g, '\\\'');        
        tempString = tempString.replace(reg, "'" + tempParamKey + "'");
      }

      var reg = new RegExp('\\${' + (keyString + key) + '}', 'g');
      var tempParamKey = (param[key] + '')
      tempString = tempString.replace(reg, tempParamKey);
    }
  }
  
  return tempString;
}

var convertIf = function(children, param) {
  var evalString = children.attrs.test;
  
  // Create Evaluate string
  var keys = Object.keys(param);

  for (var i=0; i<keys.length; i++){
    if (isDict(param[keys[i]])) {
      regex = new RegExp('(^|[^a-zA-Z0-9])(' + keys[i] + ')($|[^a-zA-Z0-9])', 'g');
      evalString = evalString.replace(regex, " param." + keys[i] + ".");          
    } else {
      regex = new RegExp('(^|[^a-zA-Z0-9])(' + keys[i] + ')($|[^a-zA-Z0-9])', 'g');
      evalString = evalString.replace(regex, ' param.' + keys[i] + ' ');
    }
  }
  
  evalString = evalString.replace(/ and /gi, ' && ');
  evalString = evalString.replace(/ or /gi, ' || ');

  // Execute Evaluate string
  try {
    if (eval(evalString)) {
      var addString = '';
      for (var i=0, nextChildren; nextChildren=children['children'][i]; i++){
        addString += convertChildren(nextChildren, param);
      }
      return addString;

    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
}

var convertForeach = function (children, param) {
  var collection = eval('param.' + children.attrs.collection);
  var item = children.attrs.item;
  var open = (children.attrs.open == null)? '' : children.attrs.open;
  var close = (children.attrs.close == null)? '' : children.attrs.close;
  var separator = (children.attrs.separator == null)? '' : children.attrs.separator;
  
  var foreachTexts = [];
  for (var j=0, coll; coll=collection[j]; j++){
    var foreachParam = param;
    foreachParam[item] = coll;
    
    for (var k=0, nextChildren; nextChildren=children.children[k]; k++){
      var foreachText = convertChildren(nextChildren, foreachParam);
      foreachText = foreachText.replace(/^\s*$/g, '');
      
      if (foreachText != null && foreachText.length > 0){
        foreachTexts.push(foreachText);
      }
    }
  }
  
  return (open + foreachTexts.join(separator) + close);  
}

var convertWhere = function(children, param) {
  var evalString = "";
  
  for (var j=0, nextChildren; nextChildren=children.children[j]; j++){
    evalString += convertChildren(nextChildren, param);
  }
  
  // Remove AND, OR
  var whereRegex = new RegExp('(^)([\\s]*?)(and|or)', 'gi');
  evalString = evalString.replace(whereRegex, "");

  var whereRegex = new RegExp('(and|or)([\\s]*?)($)', 'gi');
  evalString = evalString.replace(whereRegex, "");

  var whereRegex = new RegExp('([a-zA-Z])', 'g');
  var w = evalString.match(whereRegex);

  if (w != null && w.length > 0) {
    evalString = "WHERE " + evalString;
  }
  
  return evalString;
}

var convertAfterworks = function(copyMapper) {
  // Remove comma(,) before WHERE
  var regex = new RegExp('(,)([\\s]*?)(where)', 'gi');
  copyMapper = copyMapper.replace(regex, ' WHERE ');
  
  // Remove comma(,) after SET
  regex = new RegExp('(set)([\\s]*?)(,)', 'gi');
  copyMapper = copyMapper.replace(regex, ' SET ');

  // Remove whitespaces
  copyMapper = copyMapper.replace(/^\s*\n/g, '');
  copyMapper = copyMapper.replace(/\s*$/g, '');
  
  return copyMapper;
}

var isDict = function(v) {
  return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}

module.exports = {
  convertChildren,
  convertParameters,
  convertIf,
  convertWhere,
  convertForeach,
  convertAfterworks,
  isDict
};