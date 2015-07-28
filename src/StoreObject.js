'use strict';
var utils = require('./utils.js');
var Mapper = require('./Mapper.js');

var StoreObject = function () {

  var StoreObjectProto = {
    set: function (key, value) {

      return this.__.update(this, function (obj, helpers, traverse) {

        // If an array is set there might be immutable objects in it that needs
        // a path update
        if (Array.isArray(value)) {
          value.forEach(function (item, index) {
            if (item.__) {
              item.__.path[item.__.path.length - 1] = index;
            }
          });
        }

        helpers.currentPath.push(key);
        obj[key] = traverse(helpers, value);
        helpers.currentPath.pop();
      });

    },
    toJS: function () {
      return utils.toJS(this);
    },
    merge: function (mergeObj) {
      if (Array.isArray(mergeObj) || typeof mergeObj !== 'object' || mergeObj === null) {
        throw new Error('You have to pass an object to the merge method');
      }
      return this.__.update(this, function (obj, helpers, traverse) {
        Object.keys(mergeObj).forEach(function (key) {
          helpers.currentPath.push(key);
          obj[key] = traverse(helpers, mergeObj[key]);
          helpers.currentPath.pop();
        });
      });
    },
    unset: function(key) {
      return this.__.update(this, function (obj) {
        delete obj[key];
      });
    }
  };

  return function (props, helpers) {
    var object = Object.create(StoreObjectProto);

    Object.defineProperty(object, '__', {
      value: {
        path: helpers.currentPath.slice(0),
        update: helpers.update,
        updateMapping: helpers.updateMapping,
        currentMapping: helpers.currentMapping
      }
    });

    Object.keys(props).forEach(function (key) {

      // If already is a mapping, reset it with new value
      var propertyDescription = Object.getOwnPropertyDescriptor(props, key);
      if (propertyDescription && propertyDescription.get && propertyDescription.set) {
        helpers.mapper.set(object, key, helpers.mapper.get(object, key));
      } else if (typeof props[key] === 'function') {
        helpers.mapper.set(object, key, props[key]());
      } else {
        object[key] = props[key];
      }

    });
    return object;
  };

};

module.exports = StoreObject();
