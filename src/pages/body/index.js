import React, { Component } from 'react';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import isHotkey from 'is-hotkey';
import { QUERY_STATUS } from '../../constants';
import RecordList from './records';
import ExportButton from './widgets/export-button';
import { getValidSQL, getErrorMsg } from '../../utils/utils';

class Body extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      sql: props.currentView.sql || '',
      result: {},
      queryStatus: QUERY_STATUS.READY,
      displayHistoryOptions: [],
    };
    this.isActiveQueryId = true;
  }

  componentDidMount() {
    const options = this.props.getCurrentHistorySqlOptions();
    this.setState({ displayHistoryOptions: options });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentView } = nextProps;
    if (currentView._id !== this.props.currentView._id) {
      this.setState({
        sql: currentView.sql,
        result: {},
        isOpen: false,
        displayHistoryOptions: this.props.getCurrentHistorySqlOptions(),
        queryStatus: QUERY_STATUS.READY,
      });
    }
  }

  toggleInput = () => {
    this.setState({ isOpen: !this.state.isOpen }, () => {
      if (this.state.isOpen) {
        this.onSqlChange(this.state.sql);
      }
    });
  };

  onChange = (event) => {
    const value = event.target.value;
    this.onSqlChange(value);
  };

  onKeyDown = (event) => {
    if (isHotkey('enter', event)) {
      this.onQuery();
    }
  };

  getResult = () => {
    const { sql, queryStatus, result } = this.state;
    if (!sql) {
      return { success: false, error_message: intl.get('SQL_is_required') };
    }
    if (queryStatus === QUERY_STATUS.READY) {
      return { success: false, error_message: intl.get('Please_query_first') };
    }
    if (queryStatus === QUERY_STATUS.DOING) {
      return { success: false, error_message: intl.get('Querying_try_again_later') };
    }
    return { ...result, isActiveQueryId: this.isActiveQueryId };
  };

  getValidSQL = (sql) => {
    const validSQL = getValidSQL(sql);
    if (validSQL !== sql) {
      this.isActiveQueryId = false;
    }
    return validSQL;
  };

  onQuery = () => {
    const { sql, queryStatus } = this.state;
    if (!sql || (queryStatus === QUERY_STATUS.DOING)) return;
    this.isActiveQueryId = true;
    const validSQL = this.getValidSQL(sql);
    const { currentView } = this.props;
    this.inputRef.blur();
    this.setState({ queryStatus: QUERY_STATUS.DOING }, () => {
      this.props.sqlQuery(validSQL).then(res => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: res.data, isOpen: false });
      }).catch(error => {
        const errorMessage = getErrorMsg(error);
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: { error_message: intl.get(errorMessage) || errorMessage, isOpen: false } });
      });
      const options = this.props.getCurrentHistorySqlOptions();
      const newOptions = options.includes(sql) ? options : [sql.trim(), ...options];
      this.props.saveHistorySqlOptions(newOptions);
      const { sql: oldSQL } = currentView;
      if (oldSQL !== sql) {
        this.props.updateView({ sql: sql });
      }
    });
  };

  onSqlChange = (sql) => {
    const validSql = sql.trim();
    const options = this.props.getCurrentHistorySqlOptions();
    let displayHistoryOptions = options;
    if (validSql) {
      displayHistoryOptions = options.filter(option => option.toLowerCase().indexOf(validSql.toLowerCase()) > -1);
    }
    this.setState({ sql, displayHistoryOptions }, () => {
      this.inputRef.focus();
    });
  };

  getGridWidth = () => {
    return this.sqlQueryRefRef ? this.sqlQueryRefRef.offsetWidth - 32 : 0;
  };

  getGridHeight = () => {
    return this.sqlQueryRefRef ? this.sqlQueryRefRef.offsetHeight - 32 : 0;
  };

  renderHistorySqlOptions = () => {
    if (!this.props) return '';
    const { displayHistoryOptions } = this.state;
    if (displayHistoryOptions < 1) return '';
    return (
      <DropdownMenu className="dtable-dropdown-menu">
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
  };

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
    const { success, error_message, results, metadata: columns, is_join_stmt: isJoinStmt  } = result;
    if (success) {
      const displayColumns = this.isActiveQueryId ? columns : columns.filter(column => column.key !== '_id');
      const gridWidth = this.getGridWidth();
      const gridHeight = this.getGridHeight();
      return (
        <RecordList
          isJoinStmt={isJoinStmt}
          columns={displayColumns}
          records={results}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          getUserCommonInfo={this.props.getUserCommonInfo}
          getTables={this.props.getTables}
          cellValueUtils={this.props.cellValueUtils}
          currentTable={this.props.currentTable}
          getTableById={this.props.getTableById}
          getViewById={this.props.getViewById}
        />
      );
    }
    return (
      <div className="sql-query-result failed">
        {error_message}
      </div>
    );
  };

  render() {
    const { isOpen, sql, queryStatus } = this.state;
    return (
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
            disabled={!sql || (sql && queryStatus === QUERY_STATUS.DOING)}
          >
            {intl.get('Query')}
          </Button>
          <ExportButton
            export={this.props.export}
          />
        </div>
        <div className="search-result-wrapper" ref={ref => this.sqlQueryRefRef = ref}>
          {this.renderResult()}
        </div>
      </div>
    );
  }
}

Body.propTypes = {
  currentView: PropTypes.object,
  currentTable: PropTypes.object,
  cellValueUtils: PropTypes.object,
  sqlQuery: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getCurrentHistorySqlOptions: PropTypes.func,
  saveHistorySqlOptions: PropTypes.func,
  updateView: PropTypes.func,
  getTables: PropTypes.func,
  export: PropTypes.func,
  getTableById: PropTypes.func,
  getViewById: PropTypes.func,
};

export default Body;
