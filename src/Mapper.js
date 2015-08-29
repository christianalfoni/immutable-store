var utils = require('./utils.js');

module.exports = function (helpers) {

  return {
    set: function (object, key, mapper, newStore) {

      object.__.currentMapping[object.__.path.slice().concat(key).join('')] = utils.copyObject(mapper);

      Object.keys(mapper.deps).forEach(function (dep) {
        var pathString = mapper.deps[dep].join('');
        helpers.depsOverview[pathString] = helpers.depsOverview[pathString] || [];
        helpers.depsOverview[pathString].push(object);
      });

      var value = mapper.value;
      var cachedGet = undefined;
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
        return !utils.isSame(deps, currentDeps);
      };
      // Grab dep values and create a change checker.
      // When getter runs decide if

      Object.defineProperty(object, key, {
        get: function () {

          if (newStore) {
            helpers.currentStore = newStore;
          }

          if (currentStore !== helpers.currentStore && currentDeps && hasChanged()) {
            currentDeps = getDeps();
            cachedGet = utils.makeImmutable(mapper.get(value, currentDeps));
            return cachedGet;
          }

          if (currentDeps && hasChanged()) {
            cachedGet = utils.makeImmutable(mapper.get(value, currentDeps));
            return cachedGet;
          } else if (currentDeps && cachedGet !== undefined) {
            return cachedGet;
          } else {
            currentDeps = getDeps();
            cachedGet = utils.makeImmutable(mapper.get(value, currentDeps));
            return cachedGet;
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
      return helpers.currentStore.__.currentMapping[object.__.path.slice().concat(key).join('')];
    }
  }

};
