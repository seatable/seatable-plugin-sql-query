import React from 'react';
import ReactDOM from 'react-dom';
import './setting';
import App from './app';

class TaskList {

  static execute() {
    ReactDOM.render(
      <App showDialog={true} isDevelopment={true}/>,
      document.getElementById('root')
    );
  }

}

TaskList.execute();

window.app = window.app ? window.app : {};
window.app.onClosePlugin = function() {

};

