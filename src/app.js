import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import deepCopy from 'deep-copy';
import intl from 'react-intl-universal';
import { toaster } from 'dtable-ui-component';
import './locale/index.js';
import { PLUGIN_NAME, DEFAULT_SETTINGS, NOT_SUPPORT_COLUMN_TYPES } from './constants';
import { Header, Body } from './pages';
import SqlOptionsLocalStorage from './api/sql-options-local-storage';
import { generatorViewId } from './utils/common-utils';
import { View } from './model';
import CellValueUtils from './utils/cell-value-utils';

import './assets/css/app.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: props.showDialog || false,
      currentViewIdx: 0,
      views: [],
    };
    this.dtable = new DTable();
    this.sqlOptionsLocalStorage = null;
    this.cellValueUtils = new CellValueUtils({ dtable: this.dtable });
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ showDialog: nextProps.showDialog });
  } 

  async initPluginDTableData() {
    const { isDevelopment } = this.props;
    if (isDevelopment) {
      // local develop
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      const { dtableUuid } = this.dtable.config;
      this.sqlOptionsLocalStorage = new SqlOptionsLocalStorage(dtableUuid);
      let relatedUsersRes = await this.dtable.dtableStore.dtableAPI.getTableRelatedUsers();
      window.app = {
        state: {
          collaborators: relatedUsersRes.data.user_list,
        },
        collaboratorsCache: []
      };
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else { 
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
      const { dtableUuid } = window.app.dtableStore.dtableSettings;
      this.sqlOptionsLocalStorage = new SqlOptionsLocalStorage(dtableUuid);
    }

    this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });

    const views = this.getPluginSettings();
    this.setState({ currentViewIdx: 0, views });
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  getCellValueDisplayString(cellValue, column, {tables = [], collaborators = []} = {}) {
    return this.cellValueUtils.getCellValueDisplayString(cellValue, column, { tables, collaborators });
  }

  resetData = () => {
    const views = this.getPluginSettings();
    let { currentViewIdx } = this.state;
    if (!views[currentViewIdx]) {
      currentViewIdx = views.length - 1;
    }
    this.setState({ currentViewIdx, views });
  }

  // callBack: scroll to new view
  addView = (viewName, callBack) => {
    let { views } = this.state;
    let currentViewIdx = views.length;
    let _id = generatorViewId(views);
    let newView = new View({ _id, name: viewName, sql: '' });
    let newViews = deepCopy(views);
    newViews.push(newView);
    this.updateViews(currentViewIdx, newViews, callBack);
  }

  deleteView = () => {
    let { currentViewIdx } = this.state;
    const { views } = this.state;
    let newViews = deepCopy(views);
    newViews.splice(currentViewIdx, 1);
    if (currentViewIdx >= newViews.length) {
      currentViewIdx = newViews.length - 1;
    }
    this.updateViews(currentViewIdx, newViews);
  }

  updateView = (update = {}) => {
    const { views, currentViewIdx } = this.state;
    const changeView = views[currentViewIdx];
    let newViews = deepCopy(views);
    newViews.splice(currentViewIdx, 1, { ...changeView, ...update });
    this.updateViews(currentViewIdx, newViews);
  }

  export = async () => {
    const result = this.bodyRef.getResult();
    const { currentViewIdx, views } = this.state;
    const view = views[currentViewIdx];
    const { name } = view;
    const { success, error_message, results, error_msg, metadata: columns, isInternalError } = result;
    if (success) {
      try {
        const tables = this.dtable.getTables();
        const collaborators = window.app.state.collaborators;
        const supportColumns = columns.filter(column => !NOT_SUPPORT_COLUMN_TYPES.includes(column.type));
        const validResults = this.cellValueUtils.getExportRows(supportColumns, results, { tables, collaborators });
        const validColumns = this.cellValueUtils.getExportColumns(supportColumns);
        await this.dtable.importDataIntoNewTable(name, validColumns, validResults);
        this.onCloseToggle();
        window.app.onSelectTable && window.app.onSelectTable(tables.length - 1);
      } catch (error) {
        const { message } = error;
        toaster.danger(intl.get(message));
      }
      return;
    }
    if (isInternalError) {
      toaster.danger(intl.get(error_message));
      return;
    }
    toaster.danger(error_message || error_msg);
  }

  updateViews = (currentViewIdx, views, callBack) => {
    this.setState({ currentViewIdx, views }, () => {
      this.updatePluginSettings(views);
      callBack && callBack();
    });
  }
 
  onSelectView = (viewId) => {
    const { views } = this.state;
    let viewIdx = views.findIndex(view => view._id === viewId);
    if (viewIdx > -1) {
      this.setState({ currentViewIdx: viewIdx });
    }
  }

  getPluginSettings = () => {
    return this.dtable.getPluginSettings(PLUGIN_NAME) || DEFAULT_SETTINGS;
  }

  updatePluginSettings = (pluginSettings) => {
    this.dtable.updatePluginSettings(PLUGIN_NAME, pluginSettings);
  }

  getCurrentHistorySqlOptions = () => {
    if (!this.sqlOptionsLocalStorage) return [];
    return this.sqlOptionsLocalStorage.getCurrentHistorySqlOptions();
  }

  saveHistorySqlOptions = (newOptions) => {
    this.sqlOptionsLocalStorage.saveHistorySqlOptions(newOptions);
  }

  onCloseToggle = () => {
    this.setState({ showDialog: false });
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  getOptionColors = () => {
    return this.dtable.getOptionColors();
  }

  getUserCommonInfo = (email, avatar_size) => {
    const dtableWebAPI = window.dtableWebAPI || this.dtable.dtableWebAPI;
    return dtableWebAPI.getUserCommonInfo(email, avatar_size);
  }

  sqlQuery = (sql) => {
    const { isDevelopment } = this.props;
    const dtableAPI = isDevelopment ? this.dtable.dtableStore.dtableAPI : window.app.dtableStore.dtableAPI;
    return dtableAPI.sqlQuery(sql);
  }

  getTables = () => {
    return this.dtable.getTables();
  }

  render() {
    const { showDialog, currentViewIdx, views } = this.state;
    if (!showDialog || !views[currentViewIdx]) return '';
    
    return (
      <div className="dtable-plugin sql-query-plugin">
        <Header
          views={views}
          currentViewIdx={currentViewIdx}
          onSelectView={this.onSelectView}
          addView={this.addView}
          deleteView={this.deleteView}
          updateView={this.updateView}
          onCloseToggle={this.onCloseToggle}
        />
        <Body
          ref={ref => this.bodyRef = ref}
          currentView={views[currentViewIdx]}
          getTables={this.getTables}
          sqlQuery={this.sqlQuery}
          getOptionColors={this.getOptionColors}
          getUserCommonInfo={this.getUserCommonInfo}
          getCurrentHistorySqlOptions={this.getCurrentHistorySqlOptions}
          saveHistorySqlOptions={this.saveHistorySqlOptions}
          updateView={this.updateView}
          getCellValueDisplayString={this.getCellValueDisplayString}
          export={this.export}
        />
      </div>
    );
  }
}

App.propTypes = {
  showDialog: PropTypes.bool,
  isDevelopment: PropTypes.bool,
};

export default App;
