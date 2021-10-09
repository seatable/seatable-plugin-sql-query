import React, { Component } from 'react';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import isHotkey from 'is-hotkey';
import { QUERY_STATUS } from '../../constants';
import RecordList from './records';

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
  }

  componentDidMount() {
    const options = this.props.getCurrentHistorySqlOptions();
    this.setState({ displayHistoryOptions: options }, () => {
      this.onQuery();
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentView } = nextProps;
    if (currentView._id !== this.props.currentView._id) {
      this.setState({
        sql: currentView.sql,
        result: {},
        isOpen: false,
        displayHistoryOptions: this.props.getCurrentHistorySqlOptions()
      }, () => {
        this.onQuery();
      });
    }
  }

  toggleInput = () => {
    this.setState({ isOpen: !this.state.isOpen }, () => {
      if (this.state.isOpen) {
        this.onSqlChange(this.state.sql);
      }
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

  getResult = () => {
    const { sql, queryStatus, result } = this.state;
    if (!sql) {
      return { success: false, error_message: 'SQL_is_required', isInternalError: true };
    }
    if (queryStatus === QUERY_STATUS.DOING) {
      return { success: false, error_message: 'Querying_try_again_later', isInternalError: true };
    }
    return result;
  }

  onQuery = () => {
    const { sql, queryStatus } = this.state;
    if (!sql) return;
    if (queryStatus === QUERY_STATUS.DOING) return;
    const { currentView } = this.props;
    this.inputRef.blur();
    this.setState({ queryStatus: QUERY_STATUS.DOING }, () => {
      this.props.sqlQuery(sql).then(res => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: res.data, isOpen: false });
      }).catch(e => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: { error_msg: 'DtableDb Server Error.', isOpen: false } });
      });
      const options = this.props.getCurrentHistorySqlOptions();
      const newOptions = options.includes(sql) ? options : [ sql.trim(), ...options ];
      this.props.saveHistorySqlOptions(newOptions);
      const { sql: oldSQL } = currentView;
      if (oldSQL !== sql) {
        this.props.updateView({ sql: sql });
      }
    });
  }

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
  }

  renderHistorySqlOptions = () => {
    if (!this.props) return '';
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
          getOptionColors={this.props.getOptionColors}
          getUserCommonInfo={this.props.getUserCommonInfo}
          getTables={this.props.getTables}
          getDurationDisplayString={this.props.getDurationDisplayString}
          getGeolocationDisplayString={this.props.getGeolocationDisplayString}
        />
      );
    }
    return (
      <div className="sql-query-result failed">
        {error_message || error_msg}
      </div>
    );
  }

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
        </div>
        {this.renderResult()}
      </div>
    );
  }
}

Body.propTypes = {
  currentView: PropTypes.object,
  sqlQuery: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getCurrentHistorySqlOptions: PropTypes.func,
  saveHistorySqlOptions: PropTypes.func,
  updateView: PropTypes.func,
  getTables: PropTypes.func,
  getDurationDisplayString: PropTypes.func,
  getGeolocationDisplayString: PropTypes.func,
};

export default Body;
