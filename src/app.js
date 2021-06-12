import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import { Input, Button } from 'reactstrap';
import intl from 'react-intl-universal';
import './locale/index.js';
import { Loading, CellFormatter } from './components';
import { QUERY_STATUS, PER_DISPLAY_COUNT, NOT_SUPPORT_COLUMN_TYPES } from './constants';
import LOGO from './assets/images/sql-query.png';

import './assets/css/app.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: props.showDialog || false,
      sql: '',
      result: {},
      queryStatus: QUERY_STATUS.READY,
      displayResultsCount: PER_DISPLAY_COUNT,
      isLoading: false,
    };
    this.dtable = new DTable();
    this.sqlQueryResultRef = null;
    this.sqlQueryResultContentRef = null;
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  } 

  componentWillUnmount() {
    this.unsubscribeLocalDtableChanged();
    this.unsubscribeRemoteDtableChanged();
    this.sqlQueryResultRef = null;
    this.sqlQueryResultContentRef = null;
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
  }

  onCloseToggle = () => {
    this.setState({showDialog: false});
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  onChange = (event) => {
    const value = event.target.value;
    this.setState({sql: value});
  }

  onQuery = () => {
    const { isDevelopment } = this.props;
    const { sql, queryStatus } = this.state;
    if (queryStatus.DOING) return;
    this.setState({queryStatus: QUERY_STATUS.DOING}, () => {
      const dtableAPI = isDevelopment ? this.dtable.dtableStore.dtableAPI : window.app.dtableStore.dtableAPI;
      dtableAPI.sqlQuery(sql, 'dtable-server').then(res => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: res.data });
      }).catch(e => {
        this.setState({ queryStatus: QUERY_STATUS.DONE, result: {error_msg: 'DtableDb Server Error.' } });
      });
    });
  }

  getMoreResults = () => {
    const { isLoading, displayResultsCount, queryStatus, result } = this.state;
    if (isLoading) return;
    if (queryStatus !== QUERY_STATUS.DONE) return;
    const { success, results } = result;
    if (!success) return;
    if (displayResultsCount >= results.length) return;
    if (this.sqlQueryResultContentRef.offsetHeight + this.sqlQueryResultContentRef.scrollTop >= this.sqlQueryResultRef.offsetHeight) {
      this.setState({ isLoading: true }, () => {
        this.setState({ isLoading: false, displayResultsCount: displayResultsCount + PER_DISPLAY_COUNT });
      });
    }
  }

  getOptionColors = () => {
    return this.dtable.getOptionColors();
  }

  getUserCommonInfo = (email, avatar_size) => {
    const dtableWebAPI = window.dtableWebAPI || this.dtable.dtableWebAPI;
    return dtableWebAPI.getUserCommonInfo(email, avatar_size);
  }

  renderResult = () => {
    const { result, queryStatus, displayResultsCount, isLoading } = this.state;
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
      const disPlayColumns = columns.filter(column => !NOT_SUPPORT_COLUMN_TYPES.includes(column.type));
      const displayResults = results.slice(0, displayResultsCount);
      return (
        <div className="sql-query-result success">
          <div className="sql-query-result-content" onScroll={this.getMoreResults} ref={ref => this.sqlQueryResultContentRef = ref}>
            <table className="sql-query-result-table" ref={ref => this.sqlQueryResultRef = ref}>
              <thead className="sql-query-result-thead">
                <tr className="sql-query-result-thead-tr" key="-1">
                  {disPlayColumns.map(column => {
                    const { key, name } = column;
                    return (
                      <th className="sql-query-result-thead-th" key={`${key}-0`}>
                        <div className="sql-query-result-column-content text-truncate">
                          {/* <i className={`${COLUMNS_ICONS[type]} sql-query-result-column-icon`}></i> */}
                          {name}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {displayResults.map((result, index) => {
                  return (
                    <tr className="sql-query-result-tbody-tr" key={result._id || index}>
                      {disPlayColumns.map(column => {
                        const { key, name } = column;
                        const value = result[name];
                        return (
                          <td className="sql-query-result-tbody-td" key={`${key}-${{index}}`}>
                            <CellFormatter
                              collaborators={window.app.state.collaborators}
                              cellValue={value}
                              column={column}
                              getOptionColors={this.getOptionColors}
                              getUserCommonInfo={this.getUserCommonInfo}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {isLoading && <Loading />}
          </div>
        </div>
      );
    }
    return (
      <div className="sql-query-result failed">
        {error_message || error_msg}
      </div>
    );
  }

  render() {
    let { showDialog, sql, queryStatus } = this.state;
    if (!showDialog) {
      return '';
    }
    
    return (
      <div className="dtable-plugin sql-query-plugin">
        <div className="sql-query-plugin-header">
          <div className="sql-query-plugin-header-left">
            <img src={LOGO} alt="logo" width="24"/>
            <span className="ml-2">{intl.get('SQL_query')}</span>
          </div>
          <div className="sql-query-plugin-header-right" onClick={this.onCloseToggle}>
            <i title={intl.get('Close')} className="dtable-font dtable-icon-fork-number"></i>
          </div>
        </div>
        <div className="sql-query-plugin-body">
          <div className="sql-input-container">
            <Input className="sql-input" value={sql} onChange={this.onChange} autoFocus={!sql} />
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
