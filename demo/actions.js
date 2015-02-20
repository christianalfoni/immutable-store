import Store from './Store.js';

var getDisplayedTodos = function (store) {

  return store.todos.list.filter(function (todo) {
    if (store.todos.showCompleted && todo.completed) {
      return true;
    }
    if (store.todos.showNotCompleted && !todo.completed) {
      return true;
    }
  });

};

var getCounts = function (store) {

  return store.todos.list.reduce(function (counts, todo) {
    if (todo.completed) {
      counts.completedCount++;
    } else if (!todo.completed) {
      counts.remainingCount++;
    }
    return counts;
  }, {
    completedCount: 0,
    remainingCount: 0
  });

};

var calculateStats = function (store) {

  var counts = getCounts(store);
  var displayedTodos = getDisplayedTodos(store);
  var isAllChecked = displayedTodos.filter(function (todo) {
    return !todo.completed;
  }).length === 0 && displayedTodos.length !== 0;

  store = store.todos.set('isAllChecked', isAllChecked);
  store = store.todos.set('remainingCount', counts.remainingCount);
  store = store.todos.set('completedCount', counts.completedCount);

  return store;

};

export default {
  setRoute(context) {
    var store = Store.get();
    var pathname = context.pathname;
    var showCompleted = pathname === '/#/completed' || pathname === '/#/';
    var showNotCompleted = pathname === '/#/active' || pathname === '/#/';
    store = store.todos.set('showNotCompleted', showNotCompleted);
    store = store.todos.set('showCompleted', showCompleted);
    store = store.routes.set('active', pathname);
    store = calculateStats(store);
    Store.set(store);
  },
  addTodo(title) {
    var store = Store.get();
    store = store.todos.list.push({
      title: title,
      completed: false
    });
    store = calculateStats(store);
    Store.set(store);
  },
  toggleAllChecked() {
    var store = Store.get();
    var isCompleted = !store.todos.isAllChecked;
    store.todos.list.forEach(function (todo) {
      store = todo.set('completed', isCompleted);
    });
    store = store.todos.set('isAllChecked', isCompleted);
    store = calculateStats(store);
    Store.set(store);
  },
  toggleCompleted(todo) {
    var store = Store.get();
    store = todo.set('completed', !todo.completed);
    store = calculateStats(store);
    Store.set(store);
  },
  editTodo(todo) {
    var store = Store.get();
    store = store.todos.set('editedTodo', store.todos.list.indexOf(todo));
    Store.set(store);
  },
  saveEdit(todo, newTitle) {
    var store = Store.get();
    store = todo.set('title', newTitle);
    store = store.todos.set('editedTodo', null);
    Store.set(store);
  },
  removeTodo(todo) {
    var store = Store.get();
    store = store.todos.list.splice(store.todos.list.indexOf(todo), 1);
    store = calculateStats(store);
    Store.set(store);
  },
  clearCompleted() {
    var store = Store.get();
    var newList = store.todos.list.filter(function (todo) {
      return !todo.completed;
    });
    store = store.todos.set('list', newList);
    store = calculateStats(store);
    Store.set(store);
  }
};
