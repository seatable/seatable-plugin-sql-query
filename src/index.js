import React from 'react';
import ReactDOM from 'react-dom';
import DTable from 'dtable-sdk';
import App from './app';

import './setting';

class TaskList {

  static async init() {
    const dtableSDK = new DTable();

    // local develop
    window.app = {};
    window.app.state = {};
 
    await dtableSDK.init(window.dtablePluginConfig);
    await dtableSDK.syncWithServer();

    window.app.departments = dtableSDK.dtableStore.departments;
    window.app.collaborators = dtableSDK.dtableStore.collaborators;
    window.app.state.departments = dtableSDK.dtableStore.departments;
    window.app.state.collaborators = dtableSDK.dtableStore.collaborators;
    window.app.collaboratorsCache = {};
    window.dtableWebAPI = dtableSDK.dtableWebAPI;
    window.dtableSDK = dtableSDK;
    window.dtable = {
      ...window.dtablePluginConfig,
      ...dtableSDK.config
    };
  }

  static async execute() {
    await this.init();
    ReactDOM.render(
      <App showDialog isDevelopment />, document.getElementById('root')
    );
  }

}

TaskList.execute();

window.app = window.app ? window.app : {};
window.app.onClosePlugin = function () {

};

