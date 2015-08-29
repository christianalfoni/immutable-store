'use strict';
var StoreArray = require('./StoreArray.js');
var StoreObject = require('./StoreObject.js');
var Mapper = require('./Mapper.js');
var utils = require('./utils.js');

var unfreeze = function (value, helpers) {
  if (Array.isArray(value)) {
    return StoreArray(value, helpers);
  } else if (typeof value === 'object' && value !== null) {
    return StoreObject(value, helpers);
  } else {
    return value;
  }
};

var traverse = function (helpers, value) {

  if (Array.isArray(value) && !value.__) {
    var array = value.map(function (item, index) {
      helpers.currentPath.push(index);
      var obj = traverse(helpers, item);
      helpers.currentPath.pop();
      return obj;
    });
    var storeArray = StoreArray(array, helpers);
    Object.freeze(storeArray);
    return storeArray;
  } else if (typeof value === 'object' && value !== null && !value.__) {
    var object = Object.keys(value).reduce(function (object, key) {
      helpers.currentPath.push(key);
      object[key] = traverse(helpers, value[key]);
      helpers.currentPath.pop();
      return object;
    }, {});
    var storeObject = StoreObject(object, helpers);
    Object.freeze(storeObject);
    return storeObject;
  } else {
    return value;
  }
};

var updatePath = function (helpers, obj, cb) {

  helpers.currentPath = [];

  var path = obj.__.path;

  if (!path.length) {
    helpers.currentStore = obj;
  }

  // Unfreeze the store, ready for traversal
  var newStore = unfreeze(helpers.currentStore, helpers);
  var destination = newStore;

  // Go through path in need of update and unfreeze along the
  // way to update any props
  path.forEach(function (pathKey) {
    helpers.currentPath.push(pathKey);
    destination[pathKey] = unfreeze(destination[pathKey], helpers);
    destination = destination[pathKey];
  });

  // Run the update
  cb && cb(destination, helpers, traverse);


  // Get ready for new traversal to freeze all paths
  destination = newStore;
  path.forEach(function (pathKey) {
    destination = destination[pathKey];
    Object.freeze(destination);
    helpers.currentPath.pop();
  });

  // Make ready a new store and freeze it
  var store = StoreObject(newStore, helpers);

  Object.keys(newStore).forEach(function (key) {

    var propertyDescription = Object.getOwnPropertyDescriptor(newStore, key);
    if (propertyDescription && propertyDescription.get && propertyDescription.set) {
      Object.defineProperty(store, key, {
        get: function () {
          helpers.currentStore = this;
          return propertyDescription.get();
        }
      });

    } else {
      Object.defineProperty(store, key, {
        enumerable: true,
        get: function () {
          helpers.currentStore = this;
          return newStore[key];
        }
      });
    }

  });

  Object.defineProperty(store, 'export', {
    enumerable: false,
    value: function () {
      return utils.export(store, helpers.mapper);
    }
  });

  Object.defineProperty(store, 'import', {
    enumerable: false,
    value: function (obj) {
      return utils.import(obj, helpers, []);
    }
  });

  Object.freeze(store);
  return store;
};

var createStore = function (helpers, state) {
  var store = StoreObject({}, helpers);
  Object.keys(state).forEach(function (key) {
    helpers.currentPath.push(key);
    var branch = traverse(helpers, state[key]);
    helpers.currentPath.pop(key);

    if (typeof state[key] === 'function') {
      helpers.mapper.set(store, key, state[key](), store);
    } else {
      Object.defineProperty(store, key, {
        enumerable: true,
        get: function () {
          helpers.currentStore = this;
          return branch;
        }
      });
    }
  });

  Object.defineProperty(store, 'export', {
    enumerable: false,
    value: function () {
      return utils.export(store, helpers.mapper);
    }
  });

  Object.defineProperty(store, 'import', {
    enumerable: false,
    value: function (obj) {
      return utils.import(obj, helpers, []);
    }
  });

  Object.freeze(store);
  return store;
};

function Store(state) {

  if (!state || (typeof state !== 'object' || Array.isArray(state) || state === null)) {
    throw new Error('You have to pass an object to the store');
  }

  var helpers = {
    currentPath: [],
    currentStore: null,
    mapper: null,
    currentMapping: {},
    depsOverview: {},
    update: function (obj, cb) {
      helpers.currentMapping = utils.copyObject(helpers.currentMapping);

      // Go through each path that has a dep to this and update
      var pathString = obj.__.path.join('');
      if (helpers.depsOverview[pathString]) {
        helpers.depsOverview[pathString].forEach(function (dep) {
          helpers.currentStore = updatePath(helpers, dep);
        });
      }
      helpers.currentStore = updatePath(helpers, obj, cb);
      return helpers.currentStore;
    },
    updateMapping: function (path, key, value) {
      helpers.currentStore = updatePath(helpers, path, function (obj, helpers, traverse) {

        helpers.mapper.set(obj, key, helpers.mapper.get(obj, key));
        helpers.currentPath.push(key);
        obj[key] = value;
        helpers.currentPath.pop();

      });
      return helpers.currentStore;
    }
  };

  helpers.mapper = Mapper(helpers);
  helpers.currentStore = createStore(helpers, state);
  return helpers.currentStore;

}

module.exports = Store;
