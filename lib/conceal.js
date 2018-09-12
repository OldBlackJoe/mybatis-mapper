var concealIf = function(data) {
  var regex = new RegExp('(<if test=\")([\\s\\S]*?)(\">)', 'g');
  var matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('(<if test=\")([\\s\\S]*?)(\">)', 'g');
      var m = regex.exec(matches[z]);
      var change = '@if@' + m[2] + '@';

      data = data.replace(m[0], change);
    }
    data = data.replace(/<\/if>/g, '@/if@');
  }
  
  return data;
}

var concealForeach = function(data) {
  regex = new RegExp('(<foreach )([\\s\\S]*?)(>)', 'g');
  matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('(<foreach )([\\s\\S]*?)(>)', 'g');
      var m = regex.exec(matches[z]);
      var change = '@foreach@' + m[2] + '@';

      data = data.replace(m[0], change);
    }
    data = data.replace(/<\/foreach>/g, '@/foreach@');
  }
  
  return data;
}

var concealWhere = function(data) {
  regex = new RegExp('(<where>)([\\s\\S]*?)(<\/where>)', 'g');
  matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('(<where>)([\\s\\S]*?)(<\/where>)', 'g');
      var m = regex.exec(matches[z]);
      var change = '@where@' + m[2] + '@/where@';

      data = data.replace(m[0], change);
    }
  }
  
  return data;
}

var concealLt = function(data) {
  regex = new RegExp('( < )', 'g');
  matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('( < )', 'g');
      var m = regex.exec(matches[z]);
      var change = ' @lt@ ';

      data = data.replace(m[0], change);
    }
  }
  
  return data;
}

var concealLte = function(data) {
  regex = new RegExp('( <= )', 'g');
  matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('( <= )', 'g');
      var m = regex.exec(matches[z]);
      var change = ' @lte@ ';

      data = data.replace(m[0], change);
    }
  }
  
  return data;
}

var concealGt = function(data) {
  regex = new RegExp('( > )', 'g');
  matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('( > )', 'g');
      var m = regex.exec(matches[z]);
      var change = ' @gt@ ';

      data = data.replace(m[0], change);
    }
  }
  
  return data;
}

var concealGte = function(data) {
  regex = new RegExp('( >= )', 'g');
  matches = data.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp('( >= )', 'g');
      var m = regex.exec(matches[z]);
      var change = ' @gte@ ';

      data = data.replace(m[0], change);
    }
  }
  
  return data;
}

module.exports = {
  concealIf,
  concealForeach,
  concealWhere,
  concealLt,
  concealLte,
  concealGt,
  concealGte
};