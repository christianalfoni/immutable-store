var utils = require('./utils.js');

module.exports = function (helpers) {

  var mappings = {};

  return {
    set: function (object, key, mapper, newStore) {

      mappings[object.__.path.slice().concat(key).join('')] = mapper;

      var value = mapper.value;
      var cachedGet = null;
      var currentDeps = null;
      var currentStore = helpers.currentStore;
      var getDeps = function () {
        return Object.keys(mapper.deps).reduce(function (deps, key) {
          deps[key] = utils.getByPath(helpers.currentStore, mapper.deps[key]);
          return deps;
        }, {});
      };
      var hasChanged = function () {
        var deps = getDeps();
        return utils.isSame(deps, currentDeps);
      };
      // Grab dep values and create a change checker.
      // When getter runs decide if

      Object.defineProperty(object, key, {
        get: function () {

          if (newStore) {
            helpers.currentStore = newStore;
          }

          if (currentStore !== helpers.currentStore) {
            currentDeps = getDeps();
            return mapper.get(value, currentDeps);
          }
          if (currentDeps && hasChanged()) {
            cachedGet = mapper.get(value, currentDeps);
            return cachedGet;
          } else if (currentDeps) {
            return cachedGet;
          } else {
            currentDeps = getDeps();
            return mapper.get(value, currentDeps);
          }
        },
        set: function (newValue) {
          value = newValue;
          mapper.value = newValue;
        },
        enumerable: true,
        configurable: true
      });
    },
    get: function (object, key) {
      return mappings[object.__.path.slice().concat(key).join('')];
    }
  }

};
