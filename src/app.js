import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import deepCopy from 'deep-copy';
import intl from 'react-intl-universal';
import { toaster } from 'dtable-ui-component';
import './locale/index.js';
import { PLUGIN_NAME, DEFAULT_SETTINGS } from './constants';
import { Header, Body } from './pages';
import SqlOptionsLocalStorage from './api/sql-options-local-storage';
import { generatorViewId, getDisplayColumns } from './utils/common-utils';
import { View } from './model';
import CellValueUtils from './utils/cell-value-utils';
import pluginContext from './plugin-context.js';

import './assets/css/app.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: props.showDialog || false,
      currentViewIdx: 0,
      views: [],
      currentTable: {}
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
      await this.dtable.init(pluginContext.getConfig());
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

  getCellValueDisplayString = (cellValue, column, {tables = [], collaborators = []} = {}) => {
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
        const supportColumns = getDisplayColumns(columns);
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

  // move view, update `selectedViewIdx`
  onMoveView = (targetViewID, targetIndexViewID, relativePosition) => {
    // the 'names' and setting data structure in this plugin are different from the others.
    let { views: plugin_settings, currentViewIdx: selectedViewIdx } = this.state;
    let updatedViews = plugin_settings;

    let viewIDMap = {};
    updatedViews.forEach((view, index) => {
      viewIDMap[view._id] = view;
    });
    const targetView = viewIDMap[targetViewID];
    const targetIndexView = viewIDMap[targetIndexViewID];
    const selectedView = updatedViews[selectedViewIdx];

    const originalIndex = updatedViews.indexOf(targetView);
    let targetIndex = updatedViews.indexOf(targetIndexView);
    // `relativePosition`: 'before'|'after'
    targetIndex += relativePosition === 'before' ? 0 : 1;

    if (originalIndex < targetIndex) {
      if (targetIndex < updatedViews.length) {
        updatedViews.splice(targetIndex, 0, targetView);
      } else {
        // drag it to the end
        updatedViews.push(targetView);
      }
      updatedViews.splice(originalIndex, 1);
    } else {
      updatedViews.splice(originalIndex, 1);
      updatedViews.splice(targetIndex, 0, targetView);
    }

    const newSelectedViewIndex = updatedViews.indexOf(selectedView);

    //plugin_settings.views = updatedViews;
    this.setState({
      views: plugin_settings,
      currentViewIdx: newSelectedViewIndex
    }, () => {
      //setSelectedViewIds(KEY_SELECTED_VIEW_IDS, newSelectedViewIndex);
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
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
    this.getTableName(sql);
    return dtableAPI.sqlQuery(sql);
  }

  getTableName = (sql) => {
    const sqlArr = sql.split(' ');
    const sqlFromIndex = sqlArr.findIndex(i => i === 'from');
    if (sqlFromIndex === -1) return;
    const tableNameIndex = sqlFromIndex + 1;
    if (tableNameIndex > sqlArr.length) return;
    let tableName = sqlArr[tableNameIndex];
    if (!tableName) return;
    if (tableName.indexOf(';') === tableName.length - 1) {
      tableName.length(0, tableName.length - 2);
    }
    this.setState({tableName}, () => {
      const currentTable = this.dtable.getTableByName(tableName);
      this.setState({currentTable});
    });
  }

  getTables = () => {
    return this.dtable.getTables();
  }

  getLinkTableID = (currentTableId, table_id, other_table_id) => {
    return this.dtable.getLinkTableID(currentTableId, table_id, other_table_id);
  }

  getLinkedTableID = (currentTableId, table_id, other_table_id) => {
    return this.dtable.getLinkedTableID(currentTableId, table_id, other_table_id);
  }

  getTableById = (tableId) => {
    return this.dtable.getTableById(tableId);
  }

  getViewById = (table, view_id) => {
    return this.dtable.getViewById(table, view_id);
  }

  getViewRows = (view, table) => {
    return this.dtable.getViewRows(view, table);
  }

  getPluginMarginTop = () => {
    // 48: view toolbar height, 7: plugin wrapper occludes the height of tables bar
    let marginTop = 48 + 7;
    let currentTable = this.dtable.dtableStore.currentTable;
    if (!currentTable) {
      const tables = this.getTables();
      currentTable = tables[0];
    }
    const { header_settings } = currentTable;
    const { header_height } = header_settings || {};
    if (header_height === 'double') return marginTop + 56;
    return marginTop + 32;
  }

  render() {
    const { showDialog, currentViewIdx, views } = this.state;
    if (!showDialog || !views[currentViewIdx]) return '';
    const marginTop = this.getPluginMarginTop();

    return (
      <div className="dtable-plugin sql-query-plugin" style={{ height: `calc(100% - ${marginTop}px)`, marginTop: marginTop }}>
        <Header
          views={views}
          currentViewIdx={currentViewIdx}
          onSelectView={this.onSelectView}
          onMoveView={this.onMoveView}
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
          currentTable={this.state.currentTable}
          getLinkTableID={this.getLinkTableID}
          getLinkedTableID={this.getLinkedTableID}
          getTableById={this.getTableById}
          getViewById={this.getViewById}
          getViewRows={this.getViewRows}
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
