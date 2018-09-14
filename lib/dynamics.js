var convertParameters = function(copyMapper, param) {
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
  
  return copyMapper;
}

var convertIf = function(copyMapper, param) {
  // Convert if elements
  var regex = new RegExp("(@if@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/if@)", "g");
  var matches = copyMapper.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp("(@if@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/if@)", "g");
      var match = regex.exec(matches[z]);
      var evalString = match[2];

      // Create Evaluate string
      var keys = Object.keys(param);
      
      for (var i=0; i<keys.length; i++){
        regex = new RegExp("(^|[^a-zA-Z0-9])(" + keys[i] + ")($|[^a-zA-Z0-9])", "g");
        evalString = evalString.replace(regex, " param." + keys[i] + " ");
      }      
      
      evalString = evalString.replace(/ and /gi, " && ");
      evalString = evalString.replace(/ or /gi, " || ");
      
      // Execute Evaluate string
      try {
        if (eval(evalString)) {
          copyMapper = copyMapper.replace(match[0], match[4]);
        } else {
          copyMapper = copyMapper.replace(match[0], "");
        }
      } catch (e) {
        copyMapper = copyMapper.replace(match[0], "");
      }      
    }
  }

  return copyMapper;
}


var convertForeach = function (copyMapper, param) {
  // Convert foreach elements
  var regex = new RegExp(
      "(@foreach@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/foreach@)", "g");
  var matches = copyMapper.match(regex);
  
  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp(
          "(@foreach@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/foreach@)", "g");
      var m = regex.exec(matches[z]);

      var evalString = m[2];

      // Get collection=
      var collectionRegex = new RegExp("(collection=\")([\\S]*?)(\")");
      var collectionMatches = evalString.match(collectionRegex);
      var collection = eval("param." + collectionMatches[2]);

      // Get item=
      var itemRegex = new RegExp("(item=\")([\\S]*?)(\")");
      var itemMatches = evalString.match(itemRegex);
      var item = itemMatches[2];

      // Get open=
      var open = "";
      try {
        var openRegex = new RegExp("(open=\")([\\S\\s]*?)(\")");
        var openMatches = evalString.match(openRegex);
        open = openMatches[2];
      } catch (e) {
        open = "";
      }

      // Get separator=
      var separator = "";
      try {
        var separatorRegex = new RegExp("(separator=\")([\\S\\s]*?)(\")");
        var separatorMatches = evalString.match(separatorRegex);
        separator = separatorMatches[2];
      } catch (e) {
        separator = "";
      }

      // Get close=
      var close = "";
      try {
        var closeRegex = new RegExp("(close=\")([\\S\\s]*?)(\")");
        var closeMatches = evalString.match(closeRegex);
        close = closeMatches[2];
      } catch (e) {
        close = "";
      }

      var baseText = m[4];
      var forString = "";
      forString += open;

      if (collection != null && collection.length > 0) {
        for (var co = 0; co < collection.length; co++) {
          var strRegex = new RegExp("#{" + item + "}", "g");
          var intRegex = new RegExp("${" + item + "}", "g");

          var txt = baseText.replace(strRegex, "\"" + collection[co] + "\"");
          var txt = txt.replace(intRegex, collection[co]);

          if (co + 1 < collection.length) {
            forString += (txt + separator);
          } else {
            forString += txt;
          }
        }
      }

      forString += close;
      copyMapper = copyMapper.replace(m[0], forString);
    }

  }

  return copyMapper;
}

var convertWhere = function(copyMapper) {
  // Convert where elements
  var regex = new RegExp("(@where@)([\\s\\S]*?)(@\/where@)", "g");
  var matches = copyMapper.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp("(@where@)([\\s\\S]*?)(@\/where@)", "g");
      var m = regex.exec(matches[z]);

      var evalString = m[2];

      // Remove AND, OR
      var whereRegex = new RegExp("(^)([\\s]*?)(and|or)", "gi");
      evalString = evalString.replace(whereRegex, "");

      var whereRegex = new RegExp("(and|or)([\\s]*?)($)", "gi");
      evalString = evalString.replace(whereRegex, "");

      var whereRegex = new RegExp("([a-zA-Z])", "g");
      var w = evalString.match(whereRegex);

      if (w != null && w.length > 0) {
        evalString = "WHERE " + evalString;
      }
    }

    copyMapper = copyMapper.replace(m[0], evalString);
  }

  return copyMapper;
}

var convertAfterworks = function(copyMapper) {
  // Remove comma(,) before WHERE
  var regex = new RegExp("(,)([\\s]*?)(where)", "gi");
  copyMapper = copyMapper.replace(regex, " WHERE ");
  
  // Remove comma(,) after SET
  regex = new RegExp("(set)([\\s]*?)(,)", "gi");
  copyMapper = copyMapper.replace(regex, " SET ");

  // Remove whitespaces
  copyMapper = copyMapper.replace(/^\s*\n/g, "");
  copyMapper = copyMapper.replace(/\s*$/g, "");
  
  return copyMapper;
}

module.exports = {
  convertParameters,
  convertIf,
  convertWhere,
  convertForeach,
  convertAfterworks
};