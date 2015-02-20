import Component from './Component.js';
import React from 'react/addons';
import actions from './../actions.js';

class Todo extends Component {

  constructor(props) {
    this.state = {newTitle: props.todo.title};
  }

  toggleCompleted() {
    actions.toggleCompleted(this.props.todo);
  }

  edit() {
     actions.editTodo(this.props.todo);

    // FOCUS fix
    setTimeout(() => {
      var input = this.refs.edit.getDOMNode();
      input.focus();
      input.value = input.value;
    }, 0);   
  }

  remove() {
    actions.removeTodo(this.props.todo);
  }

  changeNewTitle(event) {
    this.setState({
      newTitle: event.target.value
    });
  }

  saveEdit(event) {
    event.preventDefault();
    actions.saveEdit(this.props.todo, this.state.newTitle);
  }  

  render() {

    var className = React.addons.classSet({
      completed: this.props.todo.completed,
      editing: this.props.isEditing
    });

    return (
      <li className={className}>
        <div className="view">
          <input 
            className="toggle" 
            type="checkbox" 
            onChange={this.toggleCompleted.bind(this)}
            checked={this.props.todo.completed}/>
          <label onDoubleClick={this.edit.bind(this)}>{this.props.todo.title}</label>
          <button className="destroy" onClick={this.remove.bind(this)}></button>
        </div>
        <form onSubmit={this.saveEdit.bind(this)}>
          <input 
            ref="edit"
            className="edit" 
            value={this.state.newTitle} 
            onBlur={this.saveEdit.bind(this)}
            onChange={this.changeNewTitle.bind(this)}
          />
        </form>
      </li>
    );

  }

}

export default Todo;
