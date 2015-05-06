# immutable-store

The [immutable-js](https://github.com/facebook/immutable-js) library from Facebook is powerful and fast, though it focuses on data structures in general. Immutable-store is a library that focuses specifically on storing application state. The  mutation API is extremely simple and getting values out of the store is as simple as referencing them with dot notation.

The library is heavily inspired by [Freezer](https://github.com/arqex/freezer), but uses a different approach both internally and as concept. Its goal is to be a contribution to FLUX architecture where you have a central storage that can be passed down through your components. This makes it very easy to create isomorphic apps.

React JS is still missing a good concept on passing a single store down through the components. Currently you have to pass that state using props, making your components dependant on each other. Hopefully there will soon be a concept where this is solved a bit more elegantly. I wrote an article about this, [True isomorphic apps with React and Baobab](http://christianalfoni.github.io/javascript/2015/03/01/true-isomorphic-apps-with-react-and-baobab.html). It does not use immutable store, but it could very well have been.

## Overview
- [Installing](#Installing)
- [The concept](#The-concept)
- [Defining state](#Defining-state)
- [Shallow checking](#Shallow-checking)
- [So why do we need this?](#So-why-do-we-need-this)
- [So how do we actually put everything together?](#So-how-do-we-actually-put-everything-together)
- [What do we gain specifically?](#What-do-we-gain-specifically)
- [Performance](#Performance)
- [Changes](#Changes)
- [Contributing](#Contributing)


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

A store contains the data related to what you are displaying in your application. As you can see in the demo the store is put into localStorage and when refreshing the app it is back in its exact state. If you need to cache data, store larger sets of entities etc. that is not the job of the immutable-store. Only put data that you need in the current state of your app into the store.

## Defining state
```javascript
var store = Store({
  todos: []
});
```

So the domain **todos** now has a list. You grab that list simply by:

```javascript
var store = Store({
  todos: []
});
store.todos // []
```

But you are not able to change the list in any way, it is completely immutable:

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

This will ensure that your store will never be mutated, unless you override it. You can of course still use methods like `.map()`, `.filter()` etc. as those are not methods that mutates the store. They will just return an array as expected. So why is this a good thing?

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
When working with React JS it is important to tell the components when they need to render. The `shouldComponentUpdate` method allows for checking the previous props and state object of the component with the new one to verify if a render is necessary. The check is shallow. A deep check would just strangle the application. A **PureRenderMixin** is available and it does this exact verification.

So let us create an example:

```javascript
var store = Store({
  todos: []
});

var App = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render: function () {
    return (
      <div>
        <h1>My application</h1>
        <TodosList list={this.props.todos}/>
      </div>
    );
  }
});

var TodosList = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  renderTodo: function (todo) {
    return <li>{todo.title}</li>;
  },
  render: function () {
    return (
      <ul>
        {this.props.list.map(this.renderTodo)}
      </ul>
    );
  }
});

React.render(<App todos={store.todos}/>, document.body);

```

As you can see our app is only dependant on the list and the **AppComponent** and **TodosList** component will only render when the list actually changes. And it will whenever something is added, removed or changed. To get even more performance you could take it a step further:

```javascript
var TodosList = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  renderTodo: function (todo) {
    return <Todo todo={todo}/>;
  },
  render: function () {
    return (
      <ul>
        {this.props.todos.map(this.renderTodo)}
      </ul>
    );
  }
});

var Todo = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render: function () {
    <li>{this.props.todo.title}</li>
  }
});

```

Say you had a list with 100 todos with a complex DOM structure. You would only need to render the one that actually changed. And that happens automatically using **immutable-store** and **PureRenderMixin**.

## So how do we actually put everything together?
You need to know how you mutate the store and you need to know how to react to a change in the store. So lets look at an implementation.

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

// We define our store
var store = Store({
  todos: []
});

// To share store between multiple files we
// export a getter and a setter. The setter
// will trigger a change event, passing the store
module.exports = {
  get: function () {
    return store;
  },
  set: function (updatedStore) {
    store = updatedStore;

    // We choose to wait for next animation frame
    // before triggering the change. This gives React JS
    // 16ms to check its rendering before next frame
    requestAnimationFrame(function () {
      events.emit('change', store);
    });
  } 
};
```

*actions.js*
```javascript
var Store = require('./Store.js');
var events = require('./events.js');

// We define a single action
module.exports = {
  addTodo: function (title) {

    // We get the latest version of the store
    var store = Store.get();

    // We update the todos list and put it into
    // a new store reference
    store = store.todos.push({
      title: title,
      completed: false
    });

    // Since we have a central event hub we
    // can trigger any event at any time, which
    // is good to handle state transitions
    events.emit('todo.added');

    // When we are done mutating we set the new store
    // also triggering a change event
    Store.set(store);
  }
};
```

*main.js*
```javascript
var Store = require('./Store.js');
var events = require('./events.js');
var actions = require('./actions.js');

// We create a simple app
var App = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  addTodo: function () {
    actions.addTodo(this.refs.input.getDOMNode().value);
  },
  render: function () {
    return (
      <div>
        <h1>You got {this.props.todos.length} todos</h1>
        <form onSubmit={this.addTodo}>
          <input ref="input"/>
        </form>
      </div>
    );
  }
});

// We create a method that renders the application,
// passing the todos domain of the store
var render = function (store) {
  React.render(<App todos={store.todos}/>, document.body); 
};

// Whenever a change event occurs, we render the application
// again
events.on('change', render);

// And pass the store for the initial render
render(store);
```

## What do we gain specifically?
By using the immutable-store we get three advantages:

1. It is not possible to change the values of the store directly. You have to override the existing store with the reference returned from a mutation

2. Whenever an object/array changes in the store, their parent object/arrays will also change their reference. This allows for React JS `shouldComponentUpdate`, or anything else for that matter, to verify that a change has actually happened with shallow checking

3. We get an extremely simple API for handling immutable data

## API

The following data structures can be saved in a Store:
- Object literals
- Arrays
- Primitives (e.g. strings, numbers, booleans)

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
If you compare **immutable-store** to the high performance library from Facebook [immutable-js](https://github.com/facebook/immutable-js) immutable-store is around 80% slower on setters, but 100% faster on getters. That said, number of operations are huge, so neither will ever cause a bottleneck in your application.

## Changes
**0.2.3**
- Fixed path bug on store (thanks @jrust)

**0.2.2**
- Fixed array bug using number primitives

**0.2.1**
- Fixed using **set()** on the store itself

**0.2.0**
- Added **toJS()** and **merge()** methods

**0.1.1** 
- Fixed bug with **set** where value is object/array

**0.1.0**
- Initial commit

## Contributing
- `npm install` install deps
- `npm test` runs the tests
- `npm run devtest` runs a watcher on tests
- `npm run deploy` deploys the code to dist
- `npm run dev` runs a server on localhost:8080 and packages automatically
- `npm run demo` runs demo on localhost:8080
- When in dev use `build/index.html` to try code
