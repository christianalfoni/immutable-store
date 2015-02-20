import './../node_modules/todomvc-common/base.css';
import './../node_modules/todomvc-app-css/index.css';
import React from 'react/addons';
import AddTodo from './components/AddTodo.js';
import TodosList from './components/TodosList.js';
import TodosFooter from './components/TodosFooter.js';
import Store from './Store.js';
import events from './events.js';
import Page from 'page';
import actions from './actions.js';

var App = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  componentWillMount: function () {
    if (!location.hash) {
      location.hash = '#/';
    }
    Page('/', actions.setRoute);
    Page('/active', actions.setRoute);
    Page('/completed', actions.setRoute);
    Page.start();
  },
  render: function () {
    var todos = this.props.store.todos;
    var routes = this.props.store.routes;
    return (
      <div>
        <section id="todoapp">
          <header id="header">
            <h1>todos</h1>
            <AddTodo todos={todos}/>
          </header>
          {todos.list.length ? <TodosList todos={todos}/> : null}
          {todos.list.length ? <TodosFooter todos={todos} routes={routes}/> : null}
        </section>
        <footer id="info">
          <p>Double-click to edit a todo</p>
          <p>Credits:
            <a href="http://christianalfoni.com">Christian Alfoni</a>,
          </p>
          <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
      </div>
    );
  }
});

var render = function (store) {
  React.render(<App store={store}/>, document.body);
};
events.on('change', render);
render(Store.get());
