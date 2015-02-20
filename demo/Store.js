import Store from './../src/Store.js';
import events from './events.js';

var state = localStorage.store ? JSON.parse(localStorage.store) : {
  todos: {
    list: [],
    isSaving: false,
    isAllChecked: false,
    editedTodo: null,
    showCompleted: true,
    showNotCompleted: true,
    remainingCount: 0,
    completedCount: 0
  },
  routes: {
    active: ''
  }
};
var store = Store(state);

export default {
  get: function () {
    return store;
  },
  set: function (updatedStore) {
    store = updatedStore;
    localStorage.store = JSON.stringify(store);
    requestAnimationFrame(function () {
      events.emit('change', store);
    });
  }
}
