# immutable-store

The [immutable-js](https://github.com/facebook/immutable-js) library from Facebook is powerful and fast, though it focuses on data structures in general. Immutable-store is a library that focuses specifically on storing application state. The  mutation API is extremely simple and getting values out of the store is as simple as referencing them with dot notation.

## Overview
- [Installing](#installing)
- [The concept](#the-concept)
- [Defining state](#defining-state)
- [Mapping state](#mapping-state)
- [Import and export](#import-and-export)
- [Shallow checking](#shallow-checking)
- [So why do we need this?](#so-why-do-we-need-this)
- [So how do we actually put everything together?](#so-how-do-we-actually-use-the-store)
- [What do we gain specifically?](#what-do-we-gain-specifically)
- [Performance](#performance)
- [Contributing](#contributing)

## Installing
`npm install immutable-store` or `bower install immutable-store`. You can also download the distributed file in the `dist/` folder.

## The concept
You use one single or multiple stores for your application. Put plain objects, arrays and primitives in the store.

```javascript
var store = Store({
  todos: [],
  isLoading: false,
  filter: {
    completed: true,
    active: true
  }
});
```

A store contains the data related to what you are displaying in your application. As you can see in the demo the store is put into localStorage and when refreshing the app it is back in its exact state.

## Defining state
```javascript
var store = Store({
  todos: []
});
```

So the state **todos** now has a list. You grab that list simply by:

```javascript
var store = Store({
  todos: []
});
store.todos // []
```

But you are not able to change the list in any way, it is immutable:

```javascript
var store = Store({
  todos: []
});

store.todos[0] = 'foo';
store.todos[0] // []

store.todos.push('bar');
store.todos // []

store.todos.splice(0, 0, 'something');
store.todos // []
```

When a mutation is done to some part of a store the new store is returned. So to do a mutation you have to override the existing store:

```javascript
var store = Store({
  todos: []
});

store.todos[0] = 'foo';  // Will never work
store.todos // []

// Notice the new version of the store is
// returned
store = store.todos.push('bar');
store.todos // ['bar']

// Notice the new version of the store is
// returned
store = store.todos.splice(0, 0, 'something');
store.todos // ['something', 'bar']
```

This will ensure that your store will never be mutated, unless you override it. You can of course still use methods like `.map()`, `.filter()` etc. as those are not methods that mutates the store. They will just return a new array as expected.

## Mapping state
Immutable store lets you map state. This is very valuable when you are handling relational state. To give an example of this imagine that you have a list of projects. You want to use this list of projects as the "source of truth". So whenever you want to use a project you can reference it from the list and it will stay updated as you do changes to the "source of truth".

```js
var store = Store({

  // We convert the list of projects to an object where the keys
  // are the IDs of the projects. This makes it a lot easier to
  // lookup projects
  projects: {
    '123': {id: '123', name: 'foo'},
    '456': {id: '456', name: 'bar'}
  },

  // You can define a function which returns an object with
  // three props. Value, deps and a get method.
  projectRows: function () {
    return {

      // The initial value you want to return when pointing to:
      // store.projectRows
      value: [],

      // The deps are whatever other state in the store you
      // want to grab and keep track of
      deps: {
        projects: ['projects']
      },

      // The get method is where you do the mapping. In this
      // example the value of "projectRows" will be a list of
      // project ids. By mapping over these ids we can use
      // the deps to grab the actual project. So even though
      // the value of "projectRows" is e.g. ['123', '456'],
      // this state will return [{id: '123', name: 'foo'}, {id: '456', 'bar'}]
      get: function (value, deps) {
        return value.map(function (id) {
          return deps.projects[id];
        });
      }
    };
  }
})
```
You can access and change these mapped state values like any other value. So if you just wanted to show project '123', you could do: `store = store.set('projectRows', ['123'])`. **Note!** that you can only change the value of a mapped state with `set(key, value)`.

Now, the really cool thing is that you can actually map over an existing mapped state. Maybe for some reason you wanted a state value always show the first project in the projectRows state.

```js
var store = Store({
  projects: {
    '123': {id: '123', name: 'foo'},
    '456': {id: '456', name: 'bar'}
  },
  projectRows: function () {
    return {
      value: [],
      deps: {
        projects: ['projects']
      },
      get: function (value, deps) {
        return value.map(function (id) {
          return deps.projects[id];
        });
      }
    };
  },
  firstProjectRow: function () {
    return {
      value: null,
      deps: {
        projectRows: ['projectRows']
      },
      get: function (value, deps) {
        return deps.projectRows[0] || null;
      }
    }
  }
})
```

The way mapping works is that whenever you try to grab any of the state, for example using `store.firstProjectRow` the mapping triggers. This result will be cached in case you try to grab the value several times, until either "projects" or the value of "projectRows" changes, in this case.

## Import and export
You can import and export state on an existing store.
```js
var store = Store({
  foo: 'bar'
});
store = store.import({
  foo: 'bar2'
});
store.foo // "bar2"
```

You can of course do this with nested structures as well, but the big benefit is when you have mapped state.
```js
var store = Store({
  rows: function () {
    return {
      value: [1, 2, 3],
      deps: {},
      get: function (values, deps) {
        return values.map(function () {
          return values + 1;
        });
      }
    };
  }
});
store.rows // [2, 3, 4]
store.toJS(); // {rows: [2, 3, 4]}
store = store.import({
  rows: [6, 7, 8]
});
store.rows // [7, 8, 9]
store.toJS(); // {rows: [7, 8, 9]}
```
But when you export a store, you will not export the current values of a mapped state, but its "internal value".
```js
var store = Store({
  rows: function () {
    return {
      value: [1, 2, 3],
      deps: {},
      get: function (values, deps) {
        return values.map(function () {
          return values + 1;
        });
      }
    };
  }
});
store.rows // [2, 3, 4]
store.toJS(); // {rows: [2, 3, 4]}
store.export(); // {rows: [1, 2, 3]}
```
This allows you to even save mapped state to a server and reproduce at a later point in time.

## Shallow checking
In an application you will grab references from the store. To verify if something within the reference has changed you can now do a shallow check. An example of this would be if something in the todos list would change. Maybe a new todo was added, removed or changed. That would cause the list itself to change reference and also the store itself. Your application would know this by just checking its existing reference to the list with the new one:

```javascript
var store = Store({
  todos: [{
    id: 0,
    title: 'This, I have to do',
    completed: false
  }]
});

// Somewhere in the application you attach the reference
this.todos = store.todos;

// A change is made
store = store.todos[0].set('completed', true);

// Back at your code you can check
if (this.todos !== store.todos.list) {
  // Update some code
}
```

As you can see, you did not have to go through each item in the array to verify that a change had been done. The list itself was changed, because something nested in it did.

## So why do we need this?
When working with application state you will change that state over time. Traditionally you will overwrite each current state with a new state, loosing the old state of the application. This can be expressed simply as:

```js
var state = {
  foo: 'bar'
};

state.foo = 'bar2'; // state.foo -> 'bar' is now lost
```

But using the immutable store:
```js
var state = Store{
  foo: 'bar'
};

var newState = state.set('foo', 'bar2');
// state.foo -> 'bar' is now still available
// newState.foo -> 'bar2'
```

Also when working with traditional frameworks you put your state "everywhere". You put it in models, collections, views, controllers etc. With an immutable-store you will be putting as much state as you possibly can inside the store, and keep things simple. Everything from models, to a "showUserModal" state, which toggles the display of a modal in your application, is part of this state.

When you combine immutability with a single state tree you open up new possibilities in developer experience. First of all you have a much better overview of your applications state, but your application itself also has a much better overview. There is only one concept to change and extract state and this can be hooked on to developer tools.

In the near future you will see an explosion of new tools for developers that allows you to control the state of your application. Both forcing specific state, replaying state and move back and forth in time.

## So how do we actually use the store?
You need to know how you mutate the store and you need to know how to react to a change in the store. So lets look at a simple implementation:

*events.js*
```javascript
var EventEmitter = require('event-emitter');

// A general event hub is exposed to the application
module.exports = new EventEmitter();
```

*Store.js*
```javascript
var Store = require('immutable-store');
var events = require('./events.js');

var store = Store({
  todos: []
});

module.exports = {
  addTodo: function (title) {
    store = store.todos.push({
      title: title,
      completed: false
    });
    events.emit('change', store);
  }
};
```

*View.js*
```javascript
var store = require('./Store.js');
var events = require('./events.js');

// We grab the initial todos and set them to a variable
var todos = store.todos;

// We create a simple render method for this view. Rendering
// a count for the completed todos
var render = function () {
  document.querySelector('#completedCount').innerText = todos.filter(function (todo) {
    return todo.completed;
  }).length;
};

// We register an event for change. The good thing here is that we only have one
// event being emitted. The little IF check in the callback ensures that we only
// render when there actually is a change on or inside the todos array
events.on('change', function (updatedStore) {
  if (todos !== updatedStore.todos) {
    todos = updatedStore.todos;
    render();
  }
});

// Do the initial render
render();

```

## What do we gain specifically?
By using the immutable-store we get three advantages:

1. It is not possible to change the values of the store directly. You have to override the existing store with the reference returned from a mutation. This avoids unwanted mutations on shared state

2. Whenever an object/array changes in the store, their parent object/arrays will also change their reference. This allows you to use a single ouput on any state change, for example with a "change" event, and use simple IF statements to verify if a change in the UI is necessary

3. We get an extremely simple API for handling immutable data

## API

The following data structures can be saved in a Store:
- Object literals
- Arrays
- Primitives (e.g. strings, numbers, booleans)
- Functions (To describe mapped state)

The following data structures are *not* supported:
- [Getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) on objects
- Constructor functions (i.e. ES3 classes)
- ES6 classes

```javascript
var store = Store({
  array: [],
  object: {},
  primitive: 'foo'
});

store = store.array.push('foo');
store = store.array.splice(0, 1);
store = store.array.concat('bar');
store = store.array.pop();
store = store.array.unshift('something');
store = store.array.shift();
store.array.toJS(); // [] - plain array

store = store.object.set('foo', 'bar');
store = store.object.unset('foo');
store = store.object.merge({foo: 'overridenBar'});
store.object.toJS(); // {foo: 'overridenBar'} - plain object

store = store.set('primitive', 'bar');
store = store.unset('primitive');
```

## Performance
If you compare **immutable-store** to the high performance library from Facebook [immutable-js](https://github.com/facebook/immutable-js) immutable-store is around 80% slower on setters, but 100% faster on getters. That said, number of operations are huge and it does not really present real life usage. So to conclude... it does not matter.

## Contributing
- `npm install` install deps
- `npm test` runs the tests
- `npm run devtest` runs a watcher on tests
- `npm run deploy` deploys the code to dist
- `npm run dev` runs a server on localhost:8080 and packages automatically
- `npm run demo` runs demo on localhost:8080
- When in dev use `build/index.html` to try code
