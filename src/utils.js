"use strict";
var utils = {
  toJS: function (obj) {
    if (obj instanceof Array) {
      return obj.map(function (obj) {
        return utils.toJS(obj);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce(function (newObj, key) {
        newObj[key] = utils.toJS(obj[key]);
        return newObj;
      }, {});
    } else {
      return obj;
    }
  },
  export: function (obj, mapping) {

    if (obj instanceof Array) {
      return obj.map(function (obj) {
        return utils.export(obj, mapping);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce(function (newObj, key) {

        if (obj.__ && mapping.get(obj, key)) {
          newObj[key] = mapping.get(obj, key).value;
        } else {
          newObj[key] = utils.export(obj[key], mapping);
        }
        return newObj;
      }, {});
    } else {
      return obj;
    }
  },
  import: function (obj, helpers, path) {
    return Object.keys(obj).reduce(function (store, key) {

      if (!(obj[key] instanceof Array) && typeof obj[key] === 'object' && obj[key] !== null && utils.getByPath(store, path)) {
        path.push(key);
        var result = utils.import(obj[key], helpers, path);
        path.pop();
        return result;
      } else {
        return utils.getByPath(store, path).set(key, obj[key]);
      }

    }, helpers.currentStore);

  },
  getByPath: function (obj, path) {
    return path.reduce(function (obj, key) {
      return obj[key];
    }, obj)
  },
  isSame: function (objA, objB) {
    return Object.keys(objA).reduce(function (isSame, key) {
      return isSame ? objA[key] === objB[key] : false;
    }, true);
  }
};

module.exports = utils;
