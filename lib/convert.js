var convertChildren = function(children, param) {
  if (children.type == 'text') {
    // Convert Parameters
    return convertParameters(children, param);

  } else if (children.type == 'tag') {
    switch (children.name.toLowerCase()) {
    case 'if':
      return convertIf(children, param);
      break;
    case 'choose':
      return convertChoose(children, param);
      break;
    case 'trim':
    case 'where':
      return convertTrimWhere(children, param);
      break;
    case 'foreach':
      return convertForeach(children, param);
      break;
    case 'bind':
      param = convertBind(children, param);
      return '';
      break;
    default:
      throw new Error("XML is not well-formed character or markup. Consider using CDATA section.");
      break;
    }
  } else {
    return '';
  }
}

var convertParameters = function(children, param) {
  var convertString = children.content;

  try{
    var keyString = '';  
    if (param !== null && Object.keys(param).length != 0) {
      convertString = recursiveParameters(convertString, param, keyString);
    }
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

var recursiveParameters = function(convertString, param, keyString) {
  var keyDict = Object.keys(param);  
  
  for (var i=0, key; key=keyDict[i]; i++) {
    if (isDict(param[key])){
      var nextKeyString = keyString + key + '\\.';
      convertString = recursiveParameters(convertString, param[key], nextKeyString);
    } else {
      if (param[key] == null || param[key] == undefined) {
        var reg = new RegExp('\\#{' + (keyString + key) + '}', 'g');
        
        var tempParamKey = ('NULL')
        convertString = convertString.replace(reg, tempParamKey);
      } else {
        var reg = new RegExp('\\#{' + (keyString + key) + '}', 'g');

        var tempParamKey = (param[key] + '').replace(/"/g, '\\\"');
        tempParamKey = tempParamKey.replace(/'/g, '\\\'');        
        convertString = convertString.replace(reg, "'" + tempParamKey + "'");
      }

      var reg = new RegExp('\\${' + (keyString + key) + '}', 'g');
      var tempParamKey = (param[key] + '')
      convertString = convertString.replace(reg, tempParamKey);
    }
  }
  
  return convertString;
}

var convertIf = function(children, param) {
  try{
    var evalString = children.attrs.test;
    
    // Create Evaluate string
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
    
    evalString = evalString.replace(/ and /gi, ' && ');
    evalString = evalString.replace(/ or /gi, ' || ');
    
  } catch (err) {
    throw new Error("Error occurred during convert <if> element.")
  }
  
  // Execute Evaluate string
  try {
    if (eval(evalString)) {
      var convertString = '';
      for (var i=0, nextChildren; nextChildren=children['children'][i]; i++){
        convertString += convertChildren(nextChildren, param);
      }
      return convertString;

    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
}

var convertForeach = function (children, param) {
  try{
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
  } catch (err) {
    throw new Error("Error occurred during convert <foreach> element.");
  }
}

var convertChoose = function (children, param) {
  try{
    for (var i=0, whenChildren; whenChildren=children.children[i];i++){
      if (whenChildren.type == 'tag' && whenChildren.name.toLowerCase() == 'when'){
        var evalString = whenChildren.attrs.test;
        
        // Create Evaluate string
        var keys = Object.keys(param);
  
        for (var j=0; j<keys.length; j++){
          if (isDict(param[keys[j]])) {
            regex = new RegExp('(^|[^a-zA-Z0-9])(' + keys[j] + ')($|[^a-zA-Z0-9])', 'g');
            evalString = evalString.replace(regex, " param." + keys[j] + ".");          
          } else {
            regex = new RegExp('(^|[^a-zA-Z0-9])(' + keys[j] + ')($|[^a-zA-Z0-9])', 'g');
            evalString = evalString.replace(regex, ' param.' + keys[j] + ' ');
          }
        }
        
        evalString = evalString.replace(/ and /gi, ' && ');
        evalString = evalString.replace(/ or /gi, ' || ');
        
        // Execute Evaluate string
        try {
          if (eval(evalString)) {
            // If <when> condition is true, do it.
            var convertString = '';
            for (var k=0, nextChildren; nextChildren=whenChildren.children[k]; k++){
              convertString += convertChildren(nextChildren, param);
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
          convertString += convertChildren(nextChildren, param);
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

var convertTrimWhere = function(children, param) {  
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
      break;
    }
    
    // Convert children first.
    for (var j=0, nextChildren; nextChildren=children.children[j]; j++){
      convertString += convertChildren(nextChildren, param);
    }
    
    // Remove prefixOverrides
    var trimRegex = new RegExp('(^)([\\s]*?)(' + prefixOverrides + ')', globalSet);
    convertString = convertString.replace(trimRegex, '');
    
    if (children.name.toLowerCase() != 'trim'){
      var trimRegex = new RegExp('(' + prefixOverrides + ')([\\s]*?)($)', globalSet);
      convertString = convertString.replace(trimRegex, '');
    } 
    
    // Add Prefix
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

var convertBind = function(children, param) {
  var evalString = children.attrs.value;
  
  // Create Evaluate string
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
  
  param[children.attrs.name] = eval(evalString);

  return param;
}

var convertAfterworks = function(convertString) {
  try{
    // Remove whitespaces
    convertString = convertString.replace(/^\s*\n/g, '');
    convertString = convertString.replace(/\s*$/g, '');
    
    return convertString;
  } catch (err) {
    throw new Error("Error occurred during convert afterwork.");
  }
}


var isDict = function(v) {
  return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}

module.exports = {
  convertChildren,
  convertParameters,
  convertIf,
  convertTrimWhere,
  convertForeach,
  convertChoose,
  convertBind,
  convertAfterworks,
  isDict
};