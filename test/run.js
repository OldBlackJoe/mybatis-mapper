var fs = require('fs');
var path = require('path');

fs.readdirSync(__dirname)
  .filter(function(file) {
    return /^test.*\.js$/.test(file);
  })
  .sort()
  .forEach(function(file) {
    require(path.join(__dirname, file));
  });
