import Component from './Component.js';
import React from 'react/addons';
import actions from './../actions.js';

class AddTodo extends Component {

  constructor() {
    this.state = {title: ''};
  }

  changeTitle(event) {
    this.setState({
      title: event.target.value
    });
  }

  addTodo(event) {
    event.preventDefault();
    actions.addTodo(this.state.title);
    this.setState({
      title: ''
    });
  }

  render() {
    return (
      <form id="todo-form" onSubmit={this.addTodo.bind(this)}>
        <input 
          id="new-todo" 
          placeholder="What needs to be done?" 
          disabled={this.props.todos.isSaving}
          value={this.state.title}
          onChange={this.changeTitle.bind(this)}
        />
      </form>
    );
  }

}

export default AddTodo;
