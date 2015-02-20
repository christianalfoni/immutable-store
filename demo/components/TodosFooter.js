import Component from './Component.js';
import React from 'react/addons';
import actions from './../actions.js';

class TodosFooter extends Component {

  renderRemainingCount() {
    let count = this.props.todos.remainingCount;
    if (count === 0 || count > 1) {
      return count + ' items left'; 
    } else {
      return count + ' item left';
    }   
  }

  renderRouteClass(route) {
    return this.props.routes.active === route ? 'selected' : '';
  }

  clearCompleted() {
    actions.clearCompleted();
  }

  renderCompletedButton() {
    return (
      <button id="clear-completed" onClick={this.clearCompleted}>
        Clear completed ({this.props.todos.completedCount})
      </button>
    );
  }

  render() {
    return (
      <footer id="footer">
        <span id="todo-count"><strong>{this.renderRemainingCount()}</strong></span>
        <ul id="filters">
          <li>
            <a className={this.renderRouteClass('/#/')} href="#/">All</a>
          </li>
          <li>
            <a className={this.renderRouteClass('/#/active')} href="#/active">Active</a>
          </li>
          <li>
            <a className={this.renderRouteClass('/#/completed')} href="#/completed">Completed</a>
          </li>
        </ul>
        {this.props.todos.completedCount ? this.renderCompletedButton() : null}
      </footer>
    );
  }

}

export default TodosFooter;
