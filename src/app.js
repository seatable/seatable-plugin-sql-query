import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import { Input, Button } from 'reactstrap'
import intl from 'react-intl-universal';
import './locale/index.js'

import './assets/css/plugin-layout.css';
import './assets/css/app.css';

const QUERY_STATUS = {
  READY: 'ready',
  DOING: 'doing',
  DONE: 'done'
};

const propTypes = {
  showDialog: PropTypes.bool,
  isDevelopment: PropTypes.bool,
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: props.showDialog || false,
      sql: '',
      result: {},
      queryStatus: QUERY_STATUS.READY,
    };
    this.dtable = new DTable();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  } 

  componentWillUnmount() {
    this.unsubscribeLocalDtableChanged();
    this.unsubscribeRemoteDtableChanged();
  }

  async initPluginDTableData() {
    const { isDevelopment } = this.props;
    if (isDevelopment) {
      // local develop
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else { 
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
    }
    this.unsubscribeLocalDtableChanged = this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.unsubscribeRemoteDtableChanged = this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData();
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  resetData = () => {}

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
    if (!isDevelopment) {
      this.setState({queryStatus: QUERY_STATUS.DOING}, () => {
        const { dtableAPI } = window.app.dtableStore;
        dtableAPI.sqlQuery(sql, 'dtable-server').then(res => {
          this.setState({queryStatus: QUERY_STATUS.DONE, result: res.data});
        }).catch(e => {
          this.setState({queryStatus: QUERY_STATUS.DONE, result: e});
        });
      });
    }
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
    const { success, error_message, results } = result;
    if (success) {
      const firstResult = results[0];
      if (!firstResult) return '';
      const keys = Object.keys(firstResult);
      return (
        <div className="sql-query-result success">
          <table className="sql-query-result-table">
            <thead className="sql-query-result-thead">
              <tr className="sql-query-result-thead-tr" key="-1">
                {keys.map(key => {
                  return (
                    <th className="sql-query-result-thead-th" key={key + "--1"}>
                      {key}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                return (
                  <tr className="sql-query-result-tbody-tr" key={index}>
                    {keys.map(key => {
                      return (
                        <td className="sql-query-result-tbody-td" key={`${key}-${{index}}`}>
                          {result[key]}
                        </td>
                      );
                    })}
                  </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="sql-query-result failed">
        {error_message}
      </div>
    );
  }

  render() {
    let { showDialog, sql, queryStatus } = this.state;
    if (!showDialog) {
      return '';
    }

    /*
      <Modal isOpen={showDialog} toggle={this.onPluginToggle} className="dtable-plugin plugin-container sql-query-plugin-dialog" size="lg">
        <ModalHeader className="sql-query-plugin-header" toggle={this.onPluginToggle}>{intl.get('SQL_query')}</ModalHeader>
        <ModalBody className="sql-query-plugin-body">
          <div className="sql-input-container">
            <Input className="sql-input" value={sql} onChange={this.onChange}/>
            <Button color="primary" className="query-sql-button" onClick={this.onQuery}>{intl.get('Query')}</Button>
          </div>
          {this.renderResult()}
        </ModalBody>
      </Modal>
    
    */
    
    return (
      <div className="dtable-plugin sql-query-plugin">
        <div className="sql-query-plugin-header">
          <div className="sql-query-plugin-header-left">
            {intl.get('SQL_query')}
          </div>
          <div className="sql-query-plugin-header-right" onClick={this.onCloseToggle}>
            <i title={intl.get('Close')} className="dtable-font dtable-icon-fork-number"></i>
          </div>
        </div>
        <div className="sql-query-plugin-body">
          <div className="sql-input-container">
            <Input className="sql-input" value={sql} onChange={this.onChange}/>
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

App.propTypes = propTypes;

export default App;
