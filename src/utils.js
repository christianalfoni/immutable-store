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
