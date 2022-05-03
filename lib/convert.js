var convertChildren = function(children, param, namespace, myBatisMapper) {
  if (param == null) {
    param = {};
  }
  if (!isDict(param)){
    throw new Error("Parameter argument should be Key-Value type or Null.");
  }
  
  if (children.type == 'text') {
    // Convert Parameters
    return convertParameters(children, param);

  } else if (children.type == 'tag') {
    switch (children.name.toLowerCase()) {
    case 'if':
      return convertIf(children, param, namespace, myBatisMapper);
    case 'choose':
      return convertChoose(children, param, namespace, myBatisMapper);
    case 'trim':
    case 'where':
      return convertTrimWhere(children, param, namespace, myBatisMapper);
    case 'set':
      return convertSet(children, param, namespace, myBatisMapper);
    case 'foreach':
      return convertForeach(children, param, namespace, myBatisMapper);
    case 'bind':
      param = convertBind(children, param);
      return '';
    case 'include':
      return convertInclude(children, param, namespace, myBatisMapper);
    default:
      throw new Error("XML is not well-formed character or markup. Consider using CDATA section.");
    }
  } else {
    return '';
  }
}

var convertParameters = function(children, param) {
  var convertString = children.content;

  try{
    convertString = convertParametersInner('#', convertString, param);
    convertString = convertParametersInner('$', convertString, param);
  } catch (err) {
    throw new Error("Error occurred during convert parameters.");
  }
  
  try{
    // convert CDATA string
    convertString = convertString.replace(/(\&amp\;)/g,'&');
    convertString = convertString.replace(/(\&lt\;)/g,'<');
    convertString = convertString.replace(/(\&gt\;)/g,'>');
    convertString = convertString.replace(/(\&quot\;)/g,'"');
  } catch (err) {
    throw new Error("Error occurred during convert CDATA section.");
  }
  
  return convertString;
}

var isObject = function (variable) {
  return typeof variable === 'object' && variable !== null;
}

var isArray = function (variable) {
  return isObject(variable) && variable.hasOwnProperty('length');
}

var convertParametersInner = function(change, convertString, param) {
  var stringReg = new RegExp('(\\' + change + '\\{[a-zA-Z0-9._\\$]+\\})', 'g');
  var stringTarget = convertString.match(stringReg);
  
  if (stringTarget != null && stringTarget.length > 0){
    stringTarget = uniqueArray(stringTarget);
    
    var target = null;
    for (var i=0; i<stringTarget.length; i++) {
      target = stringTarget[i];
      var t = target.replace(change + '{', '').replace('}','');
      var tempParamKey = eval('param.' + t);
      
      if (tempParamKey !== undefined){
        var reg = new RegExp('\\' + change + '{' + t + '}', 'g');

        if (tempParamKey === null) {
          tempParamKey = 'NULL';
          convertString = convertString.replace(reg, tempParamKey);
        } else {
          if (change == '#') {
            // processing JSON fields structures
            if (isObject(tempParamKey) || isArray(tempParamKey)) {
              tempParamKey = JSON.stringify(tempParamKey);
            } else {
              tempParamKey = tempParamKey.toString().replace(/"/g, '\\\"');
            }

            tempParamKey = tempParamKey.replace(/'/g, "''");
            var replaceWith = "'" + tempParamKey + "'"
            convertString = convertString.replace(reg, () => replaceWith);            
          } else if (change == '$') {
            convertString = convertString.replace(reg, tempParamKey);
          }
        }
      }
    }
  }
  return convertString;
}

var convertIf = function(children, param, namespace, myBatisMapper) {
  try{
    var evalString = children.attrs.test;
    
    // Create Evaluate string
    evalString = replaceEvalString(evalString, param);
    
    evalString = evalString.replace(/ and /gi, ' && ');
    evalString = evalString.replace(/ or /gi, ' || ');
    
    // replace == to === for strict evaluate
    evalString = evalString.replace(/==/g, "===");
    evalString = evalString.replace(/!=/g, "!==");
    
  } catch (err) {
    throw new Error("Error occurred during convert <if> element.");
  }
  
  // Execute Evaluate string
  try {
    if (eval(evalString)) {
      var convertString = '';
      for (var i=0, nextChildren; nextChildren=children['children'][i]; i++){
        convertString += convertChildren(nextChildren, param, namespace, myBatisMapper);
      }
      return convertString;

    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
}

var convertForeach = function (children, param, namespace, myBatisMapper) {
  try{
    var collection = eval('param.' + children.attrs.collection);
    var item = children.attrs.item;
    var open = (children.attrs.open == null)? '' : children.attrs.open;
    var close = (children.attrs.close == null)? '' : children.attrs.close;
    var separator = (children.attrs.separator == null)? '' : children.attrs.separator;
    
    var foreachTexts = [];
    var coll = null;
    for (var j=0; j<collection.length; j++){
      coll = collection[j];
      var foreachParam = param;
      foreachParam[item] = coll;
      
      var foreachText = '';
      for (var k=0, nextChildren; nextChildren=children.children[k]; k++){
        var fText = convertChildren(nextChildren, foreachParam, namespace, myBatisMapper);
        fText = fText.replace(/^\s*$/g, '');
        
        if (fText != null && fText.length > 0){
          foreachText += fText;
        }
      }

      if (foreachText != null && foreachText.length > 0){
        foreachTexts.push(foreachText);
      }
    }
    
    return (open + foreachTexts.join(separator) + close);
  } catch (err) {
    throw new Error("Error occurred during convert <foreach> element.");
  }
}

var convertChoose = function (children, param, namespace, myBatisMapper) {
  try{
    for (var i=0, whenChildren; whenChildren=children.children[i];i++){
      if (whenChildren.type == 'tag' && whenChildren.name.toLowerCase() == 'when'){
        var evalString = whenChildren.attrs.test;
        
        // Create Evaluate string
        evalString = replaceEvalString(evalString, param);
        
        evalString = evalString.replace(/ and /gi, ' && ');
        evalString = evalString.replace(/ or /gi, ' || ');

        // Execute Evaluate string
        try {
          if (eval(evalString)) {
            // If <when> condition is true, do it.
            var convertString = '';
            for (var k=0, nextChildren; nextChildren=whenChildren.children[k]; k++){
              convertString += convertChildren(nextChildren, param, namespace, myBatisMapper);
            }
            return convertString;
          } else {
            continue;
          }
        } catch (e) {
          continue;
        }
      } else if (whenChildren.type == 'tag' && whenChildren.name.toLowerCase() == 'otherwise') {
        // If reached <otherwise> tag, do it.
        var convertString = '';
        for (var k=0, nextChildren; nextChildren=whenChildren.children[k]; k++){
          convertString += convertChildren(nextChildren, param, namespace, myBatisMapper);
        }
        return convertString;
      }
    }
    
    // If there is no suitable when and otherwise, just return null.
    return '';
    
  } catch (err) {
    throw new Error("Error occurred during convert <choose> element.");
  }
}

var convertTrimWhere = function(children, param, namespace, myBatisMapper) {  
  var convertString = '';
  var prefix = null;
  var prefixOverrides = null;
  var globalSet = null;
  
  try{
    switch (children.name.toLowerCase()) {
    case 'trim':
      prefix = children.attrs.prefix;
      prefixOverrides = children.attrs.prefixOverrides;
      globalSet = 'g';
      break;
    case 'where':    
      prefix = 'WHERE';
      prefixOverrides = 'and|or';
      globalSet = 'gi';
      break;
    default:
      throw new Error("Error occurred during convert <trim/where> element.");
    }
    
    // Convert children first.
    for (var j=0, nextChildren; nextChildren=children.children[j]; j++){
      convertString += convertChildren(nextChildren, param, namespace, myBatisMapper);
    }
    
    // Remove prefixOverrides
    var trimRegex = new RegExp('(^)([\\s]*?)(' + prefixOverrides + ')', globalSet);
    convertString = convertString.replace(trimRegex, '');
    
    if (children.name.toLowerCase() != 'trim'){
      var trimRegex = new RegExp('(' + prefixOverrides + ')([\\s]*?)($)', globalSet);
      convertString = convertString.replace(trimRegex, '');
    } 
    
    // Add Prefix if String is not empty.
    var trimRegex = new RegExp('([a-zA-Z])', 'g');
    var w = convertString.match(trimRegex);
  
    if (w != null && w.length > 0) {
      convertString = prefix + ' '+ convertString;
    }
    
    // Remove comma(,) before WHERE
    if (children.name.toLowerCase() != 'where'){
      var regex = new RegExp('(,)([\\s]*?)(where)', 'gi');
      convertString = convertString.replace(regex, ' WHERE ');
    }
    
    return convertString;
  } catch (err) {
    throw new Error("Error occurred during convert <" + children.name.toLowerCase() + "> element.");
  }
}

var convertSet = function(children, param, namespace, myBatisMapper) {
  var convertString = '';
  
  try{
    // Convert children first.
    for (var j=0, nextChildren; nextChildren=children.children[j]; j++){
      convertString += convertChildren(nextChildren, param, namespace, myBatisMapper);
    }
    
    // Remove comma repeated more than 2.
    var regex = new RegExp('(,)(,|\\s){2,}', 'g');
    convertString = convertString.replace(regex, ',\n');
  
    // Remove first comma if exists.
    var regex = new RegExp('(^)([\\s]*?)(,)', 'g');
    convertString = convertString.replace(regex, '');
  
    // Remove last comma if exists.
    regex = new RegExp('(,)([\\s]*?)($)', 'g');
    convertString = convertString.replace(regex, '');
    
    convertString = ' SET ' + convertString;
    return convertString;
  } catch (err) {
    throw new Error("Error occurred during convert <set> element.");
  }
}

var convertBind = function(children, param) {
  var evalString = children.attrs.value;
  
  // Create Evaluate string
  evalString = replaceEvalString(evalString, param);
  
  param[children.attrs.name] = eval(evalString);

  return param;
}

var convertInclude = function(children, param, namespace, myBatisMapper) {  
  try{
    // Add Properties to param
    for (var j=0, nextChildren; nextChildren=children.children[j]; j++){
      if (nextChildren.type == 'tag' && nextChildren.name == 'property'){
        param[nextChildren.attrs['name']] = nextChildren.attrs['value'];
      }
    }
  } catch (err) {
    throw new Error("Error occurred during read <property> element in <include> element.");
  }
  
  try{    
    var refid = convertParametersInner('#', children['attrs']['refid'], param);    
    refid = convertParametersInner('$', refid, param);
    
    var statement = '';
    for (var i=0, children; children = myBatisMapper[namespace][refid][i]; i++) {      
      statement += convertChildren(children, param, namespace, myBatisMapper);
    }  
  } catch (err) {
    throw new Error("Error occurred during convert 'refid' attribute in <include> element.");
  }
  
  return statement;
}

var isDict = function(v) {
  return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}

var replaceEvalString = function(evalString, param) {
  var keys = Object.keys(param);

  for (var i=0; i<keys.length; i++){
    var replacePrefix = '';
    var replacePostfix = '';
    var paramRegex = null;
    
    if (isDict(param[keys[i]])) {
      replacePrefix = ' param.';
      replacePostfix = '';
      
      paramRegex = new RegExp('(^|[^a-zA-Z0-9])(' + keys[i] + '\\.)([a-zA-Z0-9]+)', 'g');
    } else {      
      replacePrefix = ' param.';
      replacePostfix = ' ';
      
      paramRegex = new RegExp('(^|[^a-zA-Z0-9])(' + keys[i] + ')($|[^a-zA-Z0-9])', 'g');
    }
  
    evalString = evalString.replace(paramRegex, ("$1" + replacePrefix + "$2" + replacePostfix + "$3"));
  }
  
  return evalString;
}

var uniqueArray = function(a){
  var seen = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for(var i=0; i<len; i++) {
    var item = a[i];
    if(seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}

module.exports = {
  convertChildren,
  convertParameters,
  convertIf,
  convertTrimWhere,
  convertSet,
  convertForeach,
  convertChoose,
  convertBind
};
