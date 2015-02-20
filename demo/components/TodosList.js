import Component from './Component.js';
import React from 'react/addons';
import actions from './../actions.js';
import Todo from './Todo.js';

class TodosList extends Component {

  toggleAllChecked(event) {
    actions.toggleAllChecked();
  }

  filterTodos(todo) {
    if (this.props.todos.showCompleted && todo.completed) {
      return true;
    }
    if (this.props.todos.showNotCompleted && !todo.completed) {
      return true;
    }
    return false;
  }

  renderTodo(todo, index) {
    return <Todo key={index} todo={todo} isEditing={this.props.todos.editedTodo === index}/>
  }

  render() {
    return (
      <section id="main">
        <input 
          id="toggle-all" 
          type="checkbox" 
          checked={this.props.todos.isAllChecked}
          onChange={this.toggleAllChecked}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul id="todo-list">
          {this.props.todos.list.filter(this.filterTodos.bind(this)).map(this.renderTodo.bind(this))}
        </ul>
      </section>
    );
  }

}

export default TodosList;
