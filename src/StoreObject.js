'use strict';
var StoreObject = function () {

  var StoreObjectProto = {
    set: function (key, value) {
      return this.__.update(this.__.path, function (obj, helpers, traverse) {
        
        // If an array is set there might be immutable objects in it that needs
        // a path update
        if (Array.isArray(value)) {
          value.forEach(function (item, index) {
            if (item.__) {
              item.__.path[item.__.path.length - 1] = index;
            }
          });
        }

        obj[key] = traverse(helpers, value);
      });
    }
  };

  return function (props, helpers) {
    var object = Object.create(StoreObjectProto);
    Object.keys(props).forEach(function (key) {
      object[key] = props[key];
    });
    Object.defineProperty(object, '__', {
      value: {
        path: helpers.currentPath.slice(0),
        update: helpers.update
      }
    });
    return object;
  };

};

module.exports = StoreObject();
