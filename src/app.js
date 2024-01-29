import React from 'react';
import PropTypes from 'prop-types';
import deepCopy from 'deep-copy';
import intl from 'react-intl-universal';
import { toaster } from 'dtable-ui-component';
import { getTableByName, getTableById, getViewById } from 'dtable-utils';
import { PLUGIN_NAME, DEFAULT_SETTINGS } from './constants';
import { Header, Body } from './pages';
import SqlOptionsLocalStorage from './api/sql-options-local-storage';
import { generatorViewId, getDisplayColumns } from './utils/common-utils';
import { View } from './model';
import CellValueUtils from './utils/cell-value-utils';
import { initScrollBar } from './utils/utils';
import dtableDbAPI from './api/dtable-db-api';

import './locale';

import './assets/css/app.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    initScrollBar();
    this.state = {
      showDialog: props.showDialog || false,
      currentViewIdx: 0,
      views: [],
      currentTable: {}
    };
    this.sqlOptionsLocalStorage = null;
    this.cellValueUtils = new CellValueUtils();
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
      window.dtableSDK.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    }
    this.sqlOptionsLocalStorage = new SqlOptionsLocalStorage(window.dtable.dtableUuid);

    window.dtableSDK.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    window.dtableSDK.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });

    const views = this.getPluginSettings();
    this.setState({ currentViewIdx: 0, views });
  }

  onDTableConnect = () => {
    this.resetData();
  };

  onDTableChanged = () => {
    this.resetData();
  };

  resetData = () => {
    const views = this.getPluginSettings();
    let { currentViewIdx } = this.state;
    if (!views[currentViewIdx]) {
      currentViewIdx = views.length - 1;
    }
    this.setState({ currentViewIdx, views });
  };

  // callBack: scroll to new view
  addView = (viewName, callBack) => {
    let { views } = this.state;
    let currentViewIdx = views.length;
    let _id = generatorViewId(views);
    let newView = new View({ _id, name: viewName, sql: '' });
    let newViews = deepCopy(views);
    newViews.push(newView);
    this.updateViews(currentViewIdx, newViews, callBack);
  };

  deleteView = () => {
    let { currentViewIdx } = this.state;
    const { views } = this.state;
    let newViews = deepCopy(views);
    newViews.splice(currentViewIdx, 1);
    if (currentViewIdx >= newViews.length) {
      currentViewIdx = newViews.length - 1;
    }
    this.updateViews(currentViewIdx, newViews);
  };

  updateView = (update = {}) => {
    const { views, currentViewIdx } = this.state;
    const changeView = views[currentViewIdx];
    let newViews = deepCopy(views);
    newViews.splice(currentViewIdx, 1, { ...changeView, ...update });
    this.updateViews(currentViewIdx, newViews);
  };

  export = async () => {
    const result = this.bodyRef.getResult();
    const { currentViewIdx, views } = this.state;
    const view = views[currentViewIdx];
    const { name } = view;
    const { success, error_message, results, metadata: columns, isInternalError, isActiveQueryId } = result;
    if (success) {
      try {
        const tables = window.dtableSDK.getTables();
        const collaborators = window.app.state.collaborators;
        const supportColumns = getDisplayColumns(columns, isActiveQueryId);
        const validResults = this.cellValueUtils.getExportRows(supportColumns, results, { tables, collaborators });
        const validColumns = this.cellValueUtils.getExportColumns(supportColumns);
        await window.dtableSDK.importDataIntoNewTable(name, validColumns, validResults);
        this.onCloseToggle();
        window.app.onSelectTable && window.app.onSelectTable(tables.length - 1);
      } catch (error) {
        const { message } = error;
        toaster.danger(intl.get(message));
      }
      return;
    }
    const errorMessage = isInternalError ? intl.get(error_message) : error_message;
    toaster.danger(errorMessage);
  };

  updateViews = (currentViewIdx, views, callBack) => {
    this.setState({ currentViewIdx, views }, () => {
      this.updatePluginSettings(views);
      callBack && callBack();
    });
  };

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

    // plugin_settings.views = updatedViews;
    this.setState({
      views: plugin_settings,
      currentViewIdx: newSelectedViewIndex
    }, () => {
      // setSelectedViewIds(KEY_SELECTED_VIEW_IDS, newSelectedViewIndex);
      window.dtableSDK.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  };

  onSelectView = (viewId) => {
    const { views } = this.state;
    let viewIdx = views.findIndex(view => view._id === viewId);
    if (viewIdx > -1) {
      this.setState({ currentViewIdx: viewIdx });
    }
  };

  getPluginSettings = () => {
    return window.dtableSDK.getPluginSettings(PLUGIN_NAME) || DEFAULT_SETTINGS;
  };

  updatePluginSettings = (pluginSettings) => {
    window.dtableSDK.updatePluginSettings(PLUGIN_NAME, pluginSettings);
  };

  getCurrentHistorySqlOptions = () => {
    if (!this.sqlOptionsLocalStorage) return [];
    return this.sqlOptionsLocalStorage.getCurrentHistorySqlOptions();
  };

  saveHistorySqlOptions = (newOptions) => {
    this.sqlOptionsLocalStorage.saveHistorySqlOptions(newOptions);
  };

  onCloseToggle = () => {
    this.setState({ showDialog: false });
    window.app.onClosePlugin && window.app.onClosePlugin();
  };

  getUserCommonInfo = (email, avatar_size) => {
    return window.dtableWebAPI.getUserCommonInfo(email, avatar_size);
  };

  sqlQuery = (sql) => {
    this.getTableName(sql);
    const dtableUuid = window.dtable.dtableUuid;
    return dtableDbAPI.sqlQuery(dtableUuid, sql);
  };

  getTableName = (sql) => {
    const upperSQL = sql.toUpperCase();
    const sqlArr = sql.split(' ');
    const upperSqlArr = upperSQL.split(' ');
    const sqlFromIndex = upperSqlArr.findIndex(i => i === 'FROM');
    if (sqlFromIndex === -1) return;
    const tableNameIndex = sqlFromIndex + 1;
    if (tableNameIndex > sqlArr.length) return;
    let tableName = sqlArr[tableNameIndex];
    if (!tableName) return;
    let tableNameLength = tableName.length;
    if (tableName.indexOf(';') === tableNameLength - 1) {
      tableName = tableName.slice(0, tableNameLength - 1);
    }
    if (tableName.startsWith('`') && tableName.endsWith('`')) {
      tableNameLength = tableName.length;
      tableName = tableName.slice(1, tableNameLength - 1);
    }
    this.setState({ tableName }, () => {
      const tables = this.getTables();
      const currentTable = getTableByName(tables, tableName);
      this.setState({ currentTable });
    });
  };

  getTables = () => {
    return window.dtableSDK.getTables();
  };

  getTableById = (tableId) => {
    const tables = this.getTables();
    return getTableById(tables, tableId);
  };

  getViewById = (table, view_id) => {
    return getViewById(table.views, view_id);
  };

  getPluginMarginTop = () => {
    // 48: view toolbar height, 7: plugin wrapper occludes the height of tables bar
    let marginTop = 48 + 7;
    let currentTable = window.dtableSDK.getActiveTable();
    if (!currentTable) {
      const tables = this.getTables();
      currentTable = tables[0];
    }
    const { header_settings } = currentTable;
    const { header_height } = header_settings || {};
    if (header_height === 'double') return marginTop + 56;
    return marginTop + 32;
  };

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
          getUserCommonInfo={this.getUserCommonInfo}
          getCurrentHistorySqlOptions={this.getCurrentHistorySqlOptions}
          saveHistorySqlOptions={this.saveHistorySqlOptions}
          updateView={this.updateView}
          cellValueUtils={this.cellValueUtils}
          export={this.export}
          currentTable={this.state.currentTable}
          getTableById={this.getTableById}
          getViewById={this.getViewById}
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
