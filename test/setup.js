var nodeTest = require('node:test');

global.describe = nodeTest.describe;

global.it = function(name, fn) {
  return nodeTest.it(name, function(context) {
    if (fn.length === 0) {
      return fn.call(context);
    }

    return new Promise(function(resolve, reject) {
      var finished = false;

      function done(error) {
        if (finished) {
          return;
        }

        finished = true;

        if (error) {
          reject(error);
          return;
        }

        resolve();
      }

      try {
        var result = fn.call(context, done);

        if (result && typeof result.then === 'function') {
          result.then(function() {
            done();
          }, done);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
};
