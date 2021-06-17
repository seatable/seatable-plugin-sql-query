import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import intl from 'react-intl-universal';
import isHotkey from 'is-hotkey';
import './locale/index.js';
import { QUERY_STATUS } from './constants';
import Header from './pages/header';
import RecordList from './pages/records';
import SqlOptionsLocalStorage from './api/sql-options-local-storage';

import './assets/css/app.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: props.showDialog || false,
      sql: '',
      result: {},
      queryStatus: QUERY_STATUS.READY,
      isOpen: false,
      displayHistoryOptions: [],
    };
    this.dtable = new DTable();
    this.sqlOptionsLocalStorage = null;
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  } 

  async initPluginDTableData() {
    const { isDevelopment } = this.props;
    if (isDevelopment) {
      // local develop
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      let relatedUsersRes = await this.dtable.dtableStore.dtableAPI.getTableRelatedUsers();
      window.app = {
        state: {
          collaborators: relatedUsersRes.data.user_list,
        },
      };
    } else { 
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
    }
    const { dtableUuid } = this.dtable.config;
    this.sqlOptionsLocalStorage = new SqlOptionsLocalStorage(dtableUuid);
    const options = this.sqlOptionsLocalStorage.getCurrentHistorySqlOptions();
    this.setState({ displayHistoryOptions: options });
  }

  onCloseToggle = () => {
    this.setState({showDialog: false});
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  onSqlChange = (sql) => {
    const validSql = sql.trim();
    const options = this.sqlOptionsLocalStorage.getCurrentHistorySqlOptions();
    let displayHistoryOptions = options;
    if (validSql) {
      displayHistoryOptions = options.filter(option => option.toLowerCase().indexOf(validSql.toLowerCase()) > -1);
    }
    this.setState({ sql, displayHistoryOptions }, () => {
      this.inputRef.focus();
    });
  }

  onChange = (event) => {
    const value = event.target.value;
    this.onSqlChange(value);
  }

  onKeyDown = (event) => {
    if (isHotkey('enter', event)) {
      this.onQuery();
    }
  }

  onQuery = () => {
    const { isDevelopment } = this.props;
    const { sql, queryStatus } = this.state;
    if (!sql) return;
    if (queryStatus.DOING) return;
    this.inputRef.blur();
    this.setState({queryStatus: QUERY_STATUS.DOING}, () => {
      const dtableAPI = isDevelopment ? this.dtable.dtableStore.dtableAPI : window.app.dtableStore.dtableAPI;
      dtableAPI.sqlQuery(sql, 'dtable-server').then(res => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: res.data, isOpen: false });
      }).catch(e => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: { error_msg: 'DtableDb Server Error.', isOpen: false } });
      });
      const options = this.sqlOptionsLocalStorage.getCurrentHistorySqlOptions();
      const newOptions = options.includes(sql) ? options : [ sql.trim(), ...options ];
      this.sqlOptionsLocalStorage.saveHistorySqlOptions(newOptions);
    });
  }

  getOptionColors = () => {
    return this.dtable.getOptionColors();
  }

  getUserCommonInfo = (email, avatar_size) => {
    const dtableWebAPI = window.dtableWebAPI || this.dtable.dtableWebAPI;
    return dtableWebAPI.getUserCommonInfo(email, avatar_size);
  }

  renderResult = () => {
    const { result, queryStatus } = this.state;
    if (queryStatus === QUERY_STATUS.READY) return (
      <div className="sql-query-result ready"></div>
    );
    if (queryStatus === QUERY_STATUS.DOING) return (
      <div className="sql-query-result doing">
        {intl.get('Querying')}
      </div>
    );
    const { success, error_message, results, error_msg, metadata: columns } = result;
    if (success) {
      return (
        <RecordList
          columns={columns}
          records={results}
          getOptionColors={this.getOptionColors}
          getUserCommonInfo={this.getUserCommonInfo}
        />
      );
    }
    return (
      <div className="sql-query-result failed">
        {error_message || error_msg}
      </div>
    );
  }

  renderHistorySqlOptions = () => {
    if (!this.sqlOptionsLocalStorage) return '';
    const { displayHistoryOptions } = this.state;
    if (displayHistoryOptions < 1) return '';
    return (
      <DropdownMenu className="sql-query-input-dropdown-menu">
        {displayHistoryOptions.map((option, index) => {
          return (
            <DropdownItem
              key={`history-option-${index}`}
              className="sql-query-input-dropdown-item"
              onClick={() => this.onSqlChange(option)}
            >
              {option}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    );
  }

  toggleInput = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    let { showDialog, sql, queryStatus, isOpen } = this.state;
    if (!showDialog) {
      return '';
    }
    
    return (
      <div className="dtable-plugin sql-query-plugin">
        <Header onCloseToggle={this.onCloseToggle} />
        <div className="sql-query-plugin-body">
          <div className="sql-input-container">
            <Dropdown
              isOpen={isOpen}
              toggle={this.toggleInput}
              className="dtable-dropdown-menu sql-query-input-dropdown"
            >
              <DropdownToggle tag="span" data-toggle="dropdown" aria-expanded={isOpen} className="sql-query-input">
                <input
                  className="form-control sql-input"
                  value={sql}
                  onChange={this.onChange}
                  onKeyDown={this.onKeyDown}
                  ref={ref => this.inputRef = ref}
                />
              </DropdownToggle>
              {this.renderHistorySqlOptions()}
            </Dropdown>
            <Button
              color="primary"
              className="query-sql-button"
              onClick={this.onQuery}
              disabled={!sql || (sql && queryStatus.DOING)}
            >
              {intl.get('Query')}
            </Button>
          </div>
          {this.renderResult()}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  showDialog: PropTypes.bool,
  isDevelopment: PropTypes.bool,
};

export default App;
