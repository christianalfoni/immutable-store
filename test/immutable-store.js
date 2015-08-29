var Store = require('./../src/Store.js');

exports['throws if passing wrong argument'] = function (test) {
  test.throws(function () {
    new Store();
  });
  test.done();
};

exports['does not throw is passing an object'] = function (test) {
  test.doesNotThrow(function () {
    new Store({});
  });
  test.done();
};

exports['can not mutate the store by native mutation'] = function (test) {
  var store = new Store({});
  store.foo = 'bar';
  test.equal(Object.keys(store).length, 0);
  test.done();
};

exports['can mutate the store by using set'] = function (test) {
  var store = new Store({});
  var newStore = store.set('foo', 'bar');
  test.ok(!store.foo);
  test.equal(newStore.foo, 'bar');
  test.done();
};

exports['should not keep state across instances'] = function (test) {
  var initialStore = new Store({});
  var newStore = initialStore;

  newStore = newStore.set('foo', 'bar');
  test.ok(!initialStore.foo);
  test.equal(newStore.foo, 'bar');

  newStore = newStore.set('bar', 'foo');
  test.ok(!initialStore.bar);
  test.equal(newStore.bar, 'foo');

  newStore = initialStore;
  newStore = newStore.set('foo', 'bar');
  test.ok(!newStore.bar);

  test.done();
};

exports['does nested converting of objects'] = function (test) {
  var store = new Store({
    foo: {}
  });
  test.ok(store.foo.__);
  test.done();
};

exports['does nested converting of arrays'] = function (test) {
  var store = new Store({
    foo: [{
      list: []
    }]
  });
  test.ok(store.foo[0].list.__);
  test.done();
};

exports['does not change value on existing store'] = function (test) {
  var store = new Store({
    foo: {}
  });
  store.foo.set('foo', 'bar');
  test.ok(!store.foo.foo);
  test.done();
};

exports['new store returned has change'] = function (test) {
  var store = new Store({
    foo: {}
  });
  store = store.foo.set('foo', 'bar');
  test.equal(store.foo.foo, 'bar');
  test.done();
};

exports['Changes reference on store and object changed'] = function (test) {
  var store = new Store({
    foo: {}
  });
  var newStore = store.foo.set('foo', 'bar');
  test.notEqual(store, newStore);
  test.notEqual(store.foo, newStore.foo);
  test.done();
};

exports['Changes reference on store and array changed'] = function (test) {
  var store = new Store({
    list: []
  });
  var newStore = store.list.push('foo');
  test.notEqual(store, newStore);
  test.notEqual(store.list, newStore.list);
  test.done();
};

exports['PUSH should add an object to a list with the correct path'] = function (test) {
  var store = new Store({
    list: []
  });
  var newStore = store.list.push({});
  test.ok(newStore.list.length, 1);
  test.deepEqual(newStore.list[0].__.path, ['list', 0]);
  test.done();
};

exports['SPLICE should remove an item by index and count'] = function (test) {
  var store = new Store({
    list: [1, 2, 3, 4, 5]
  });
  var newStore = store.list.splice(0, 1);
  test.deepEqual(newStore.list, [2, 3, 4, 5]);
  newStore = newStore.list.splice(2, 2);
  test.deepEqual(newStore.list, [2, 3]);
  test.done();
};

exports['SPLICE should add items from index in converted format with correct path'] = function (test) {
  var store = new Store({
    list: ['foo']
  });
  var newStore = store.list.splice(0, 0, {});
  test.deepEqual(newStore.list[0].__.path, ['list', 0]);
  test.done();
};

exports['SPLICE should fix paths of later items and insert additions with correct path'] = function (test) {
  var store = new Store({
    list: [{}, {}, {}, {}]
  });
  var newStore = store.list.splice(1, 1, {});
  test.deepEqual(newStore.list[1].__.path, ['list', 1]);
  test.deepEqual(newStore.list[2].__.path, ['list', 2]);
  test.deepEqual(newStore.list[3].__.path, ['list', 3]);
  test.done();
};

exports['CONCAT should add converted items to existing array with correct path'] = function (test) {
  var store = new Store({
    list: []
  });
  var newStore = store.list.concat({});
  test.ok(newStore.list[0].__);
  test.deepEqual(newStore.list[0].__.path, ['list', 0])
  test.done();
};

exports['CONCAT should split arrays into arguments'] = function (test) {
  var store = new Store({
    list: []
  });
  var newStore = store.list.concat(['foo'], ['bar']);
  test.deepEqual(newStore.list, ['foo', 'bar']);
  test.done();
};

exports['UNSHIFT should add converted item to top of array and adjust paths'] = function (test) {
  var store = new Store({
    list: [{}, {}]
  });
  var newStore = store.list.unshift({});
  test.ok(newStore.list[0].__);
  test.deepEqual(newStore.list[1].__.path, ['list', 1]);
  test.deepEqual(newStore.list[2].__.path, ['list', 2]);
  test.done();
};

exports['SHIFT should remove top item of array and adjust paths'] = function (test) {
  var store = new Store({
    list: [{}, {}]
  });
  var newStore = store.list.shift();
  test.deepEqual(newStore.list[0].__.path, ['list', 0]);
  test.done();
};

exports['UNSHIFT should add converted item to top of array and adjust paths'] = function (test) {
  var store = new Store({
    list: [{}, {}]
  });
  var newStore = store.list.unshift({});
  test.ok(newStore.list[0].__);
  test.deepEqual(newStore.list[1].__.path, ['list', 1]);
  test.deepEqual(newStore.list[2].__.path, ['list', 2]);
  test.done();
};

exports['SHIFT should remove top item of array and adjust paths'] = function (test) {
  var store = new Store({
    list: [{}, {}]
  });
  var newStore = store.list.shift();
  test.deepEqual(newStore.list[0].__.path, ['list', 0]);
  test.done();
};

exports['should allow for array to be set, going through items to fix paths'] = function (test) {
  var store = new Store({
    foo: {
      list: [{}, {}]
    }
  });
  store = store.foo.set('list', store.foo.list.filter(function (item, index) { return index === 1}));
  test.deepEqual(store.foo.list[0].__.path, ['foo', 'list', 0]);
  test.done();
};

exports['should convert to plain array when using toJS'] = function (test) {
  var store = new Store({
    foo: {
      list: []
    }
  });
  var array = store.foo.list.toJS();
  test.equal(array.__proto__, [].__proto__);
  test.done();
};

exports['should convert to plain object when using toJS'] = function (test) {
  var store = new Store({
    foo: {
      bar: {}
    }
  });
  var object = store.foo.bar.toJS();
  test.equal(object.__proto__, {}.__proto__);
  test.done();
};

exports['should convert deeply when using toJS'] = function (test) {
  var store = new Store({
    foo: {
      list: [{
        foo: []
      }, {
        bar: 'foo'
      }]
    }
  });
  var array = store.foo.list.toJS();
  test.equal(array.__proto__, [].__proto__);
  test.equal(array[0].__proto__, {}.__proto__);
  test.equal(array[0].foo.__proto__, [].__proto__);
  test.equal(array[1].__proto__, {}.__proto__);
  test.done();
};

exports['should merge object'] = function (test) {
  var store = new Store({
    foo: {
      bar: {
        foo: 'bar'
      }
    }
  });
  var store = store.foo.bar.merge({test: 123});
  test.equal(store.foo.bar.foo, 'bar');
  test.equal(store.foo.bar.test, 123);
  test.done();
};

exports['should convert objects and arrays when merging'] = function (test) {
  var store = new Store({
    foo: {
      bar: {
        foo: 'bar'
      }
    }
  });
  var store = store.foo.bar.merge({obj: {}, array: []});
  test.ok(store.foo.bar.obj.__);
  test.ok(store.foo.bar.array.__);
  test.done();
};

exports['should throw when trying to merge a non object'] = function (test) {
  var store = new Store({
    foo: {
      bar: {}
    }
  });
  test.throws(function () {
    store = store.foo.bar.merge([]);
  });
  test.done();
};

exports['UNSET should delete a primitive'] = function (test) {
  var store = new Store({
    foo: 'foo',
    bar: 'bar'
  });
  var store = store.unset('foo');
  test.ok(!store.hasOwnProperty('foo'));
  test.equal(store.bar, 'bar');
  test.done();
};

exports['UNSET should delete a key from an object'] = function (test) {
  var store = new Store({
    foo: {
      fiz: [1],
      bar: [2]
    },
  });
  var store = store.foo.unset('fiz');
  test.ok(store.hasOwnProperty('foo'));
  test.ok(!store.foo.hasOwnProperty('fiz'));
  test.deepEqual(store.foo.bar, [2]);
  test.done();
};

exports['UNSET should do nothing if the key does not exist on an object'] = function (test) {
  var store = new Store({
    bar: [2]
  });
  var store = store.unset('foo');
  test.deepEqual(store.bar, [2]);
  test.done();
};

exports['should work with number primitives in array'] = function (test) {
  var store = new Store({
    items: [0]
  });
  test.equal(store.items[0], 0);
  test.done();
};

exports['the path to a store should be empty'] = function (test) {
  var store = new Store({
    items: [0]
  });
  test.equal(store.__.path.length, 0);
  store = store.items.push('foo');
  test.equal(store.__.path.length, 0);
  test.done();
};

exports['the path to a store should be empty after deep set'] = function (test) {
  var store = new Store({
    foo: {
      bar: {
        foo: 'bar'
      }
    }
  });
  test.equal(store.__.path.length, 0);
  var store = store.foo.bar.set('test', 123);
  test.equal(store.__.path.length, 0);
  test.done();
};

exports['the path to a store should be empty after deep merge'] = function (test) {
  var store = new Store({
    foo: {
      bar: {
        foo: 'bar'
      }
    }
  });
  test.equal(store.__.path.length, 0);
  var store = store.foo.bar.merge({test: 123});
  test.equal(store.__.path.length, 0);
  test.done();
};

exports['should allow mapping functions'] = function (test) {
  var store = new Store({
    projects: {},
    rows: function () {
      return {
        value: [],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    }
  });
  test.deepEqual(store.rows, []);
  test.done();
};

exports['should run mapping when getting value from store'] = function (test) {
  var store = new Store({
    projects: {},
    rows: function () {
      return {
        value: [],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          test.ok(true);
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    }
  });
  store.rows;
  test.done();
};

exports['should update value when setting it'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    rows: function () {
      return {
        value: [],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    }
  });
  var store = store.set('rows', ['123']);
  test.equal(store.rows[0], true);
  test.done();
};

exports['should only update mapping of new store'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    rows: function () {
      return {
        value: [],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    }
  });
  var newStore = store.set('rows', ['123']);
  test.equal(store.rows[0], undefined);
  test.equal(newStore.rows[0], true);
  test.done();
};


exports['should be able to grab mapped values from mapped values'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    rows: function () {
      return {
        value: [],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    },
    first: function () {
      return {
        value: null,
        deps: {
          rows: ['rows']
        },
        get: function (value, deps) {
          return deps.rows.length ? deps.rows[0] : null;
        }
      };
    }
  });

  var newStore = store.set('rows', ['123']);
  test.equal(store.first, null);
  test.equal(newStore.first, true);
  test.done();
};

exports['should change references of parents when mapped value is changed'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    foo: {
      bar: {
        rows: function () {
          return {
            value: [],
            deps: {
              projects: ['projects']
            },
            get: function (ids, deps) {
              return ids.map(function (id) { return deps.projects[id]; });
            }
          }
        }
      }
    }
  });

  var oldBar = store.foo.bar;
  var oldFoo = store.foo;
  var newStore = store.foo.bar.set('rows', ['123']);
  test.equal(newStore.foo.bar.rows[0], true);
  test.notEqual(newStore.foo, oldFoo);
  test.notEqual(newStore.foo.bar, oldBar);
  test.done();
};

exports['should make mapped values immutable'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    rows: function () {
      return {
        value: ['123'],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    }
  });

  test.doesNotThrow(function () {
    store.rows.toJS();
  });
  test.deepEqual(store.rows.toJS(), [true]);
  store.rows[1] = 'bobo';
  test.equals(store.rows.length, 1);
  test.done();
};

exports['should change references of parents when dependency value is changed'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    foo: {
      bar: {
        rows: function () {
          return {
            value: ['123'],
            deps: {
              projects: ['projects']
            },
            get: function (ids, deps) {
              return ids.map(function (id) { return deps.projects[id]; });
            }
          }
        }
      }
    }
  });

  var oldBar = store.foo.bar;
  var oldFoo = store.foo;
  var newStore = store.projects.set('123', false);
  test.equal(newStore.foo.bar.rows[0], false);
  test.notEqual(newStore.foo, oldFoo);
  test.notEqual(newStore.foo.bar, oldBar);
  test.done();
};

exports['should be able to grab values from nested structures'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    admin: {
      rows: function () {
        return {
          value: [],
          deps: {
            projects: ['projects']
          },
          get: function (ids, deps) {
            return ids.map(function (id) { return deps.projects[id]; });
          }
        }
      },
      first: function () {
        return {
          value: null,
          deps: {
            rows: ['admin', 'rows']
          },
          get: function (value, deps) {
            return deps.rows.length ? deps.rows[0] : null;
          }
        };
      }
    }
  });
  store = store.admin.set('rows', ['123']);
  test.equal(store.admin.first, true);
  test.done();
};

exports['should update when state changes'] = function (test) {
  var store = new Store({
    projects: {
      '123': true,
      '456': true
    },
    rows: function () {
      return {
        value: ['123'],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    },
    first: function () {
      return {
        value: 'mip',
        deps: {
          rows: ['rows']
        },
        get: function (value, deps) {
          return deps.rows.length ? deps.rows[0] : 'mip';
        }
      };
    }
  });
  var newStore = store.projects.set('123', false);
  test.equal(store.first, true);
  test.equal(newStore.first, false);
  store = newStore.set('rows', ['456']);
  test.equal(newStore.first, false);
  test.equal(store.first, true);
  test.done();
};

exports['should stay when other state changes, but not override other instances'] = function (test) {
  var store = new Store({
    projects: {
      '123': true
    },
    rows: function () {
      return {
        value: [],
        deps: {
          projects: ['projects']
        },
        get: function (ids, deps) {
          return ids.map(function (id) { return deps.projects[id]; });
        }
      }
    },
    foo: 'bar'
  });
  var newStore = store.set('rows', ['123']);
  newStore = store.set('foo', 'bar');
  test.equal(store.rows.length, 0);
  test.equal(newStore.rows[0], true);
  test.done();
};

exports['should extract current value using toJS on mapping'] = function (test) {
  var store = new Store({
    rows: function () {
      return {
        value: ['foo'],
        deps: {},
        get: function (values, deps) {
          return values.map(function (value) {
            return value + 1;
          });
        }
      }
    }
  });
  var exp = store.toJS();
  test.deepEqual(exp, {
    rows: ['foo1']
  });
  store = store.set('rows', ['bar']);
  var exp = store.toJS();
  test.deepEqual(exp, {
    rows: ['bar1']
  });
  test.done();
};

exports['should have a method that exports mapping values'] = function (test) {
  var store = new Store({
    rows: function () {
      return {
        value: ['foo'],
        deps: {},
        get: function (values, deps) {
          return values.map(function (value) {
            return value + 1;
          });
        }
      }
    }
  });
  var exp = store.export();
  test.deepEqual(exp, {
    rows: ['foo']
  });
  store = store.set('rows', ['bar']);
  var exp = store.export();
  test.deepEqual(exp, {
    rows: ['bar']
  });
  test.done();
};

exports['should have a method that imports values and upholds mappings'] = function (test) {
  var store = new Store({
    rows: function () {
      return {
        value: [],
        deps: {},
        get: function (values, deps) {
          return values.map(function (value) {
            return value + 1;
          });
        }
      }
    },
    foo: 'bar'
  });
  store = store.import({
    rows: ['foo'],
    foo: 'bar2'
  });
  test.deepEqual(store.toJS(), {
    rows: ['foo1'],
    foo: 'bar2'
  });
  test.done();
};

exports['should be able to do complex partial imports'] = function (test) {
  var store = new Store({
    obj: {},
    rows: function () {
      return {
        value: [],
        deps: {},
        get: function (values, deps) {
          return values.map(function (value) {
            return value + 1;
          });
        }
      }
    },
    admin: {
      foo: 'bar',
      bar: 'foo',
      map: function () {
        return {
          value: [],
          deps: {},
          get: function (values, deps) {
            return values.map(function (value) {
              return value + 1;
            });
          }
        }
      }
    }
  });
  store = store.import({
    obj: {},
    rows: ['foo'],
    foo: 'bar',
    admin: {
      map: ['foo']
    }
  });
  test.deepEqual(store.toJS(), {
    obj: {},
    rows: ['foo1'],
    foo: 'bar',
    admin: {
      foo: 'bar',
      bar: 'foo',
      map: ['foo1']
    }
  });
  test.done();
};
