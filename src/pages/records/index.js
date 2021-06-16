import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { Loading, CellFormatter } from '../../components';
import { PER_DISPLAY_COUNT, NOT_SUPPORT_COLUMN_TYPES } from '../../constants';
import { getCellRecordWidth } from '../../utils/common-utils';

import '../../assets/css/records.css';

class RecordList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      displayRecordsCount: PER_DISPLAY_COUNT
    };
    this.disPlayColumns = props.columns.filter(column => !NOT_SUPPORT_COLUMN_TYPES.includes(column.type)).map(column => { return {...column, width: getCellRecordWidth(column)}; });
    this.sqlQueryResultRef = null;
    this.sqlQueryResultContentRef = null;
  }

  getMoreResults = () => {
    const { isLoading, displayRecordsCount } = this.state;
    const { records } = this.props;
    if (isLoading) return;
    if (displayRecordsCount >= records.length) return;
    if (this.sqlQueryResultContentRef.offsetHeight + this.sqlQueryResultContentRef.scrollTop >= this.sqlQueryResultRef.offsetHeight) {
      this.setState({ isLoading: true }, () => {
        this.setState({ isLoading: false, displayRecordsCount: displayRecordsCount + PER_DISPLAY_COUNT });
      });
    }
  }

  render() {
    const { records } = this.props;
    if (!Array.isArray(records)) return '';
    const recordsCount = records.length;
    if (recordsCount === 0) {
      return (
        <div className="sql-query-result success">
          <div className="sql-query-result-none">
            {intl.get('There_are_no_records')}
          </div>
        </div>
      );
    }
    const { isLoading, displayRecordsCount } = this.state;
    const displayResults = records.slice(0, displayRecordsCount);
    const totalWidth = this.disPlayColumns.reduce((cur, nextItem) => { return (cur + nextItem.width); }, 0);
    
    return (
      <div className="sql-query-result success">
        <div className="sql-query-result-count">
          { recordsCount > 1 ? intl.get('There_are_records', { count: recordsCount }) : intl.get('There_is_1_record')}
        </div>
        <div className="sql-query-result-container">
          <div className="sql-query-result-content" style={{width: totalWidth}}>
            <div className="static-sql-query-result-content">
              <div className="sql-query-result-table-row">
                {this.disPlayColumns.map(column => {
                  const { key, name, width } = column;
                  return (
                    <div className="sql-query-result-table-cell" key={`${key}--1`} style={{width, maxWidth: width, minWidth: width}}>
                      <div className="sql-query-result-column-content text-truncate">
                        {name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="sql-query-result-table-content" onScroll={this.getMoreResults} ref={ref => this.sqlQueryResultContentRef = ref}>
              <div className="sql-query-result-table" ref={ref => this.sqlQueryResultRef = ref}>
                {displayResults.map((result, index) => {
                  return (
                    <div className="sql-query-result-table-row" key={result._id || index}>
                      {this.disPlayColumns.map(column => {
                        const { key, name, width } = column;
                        const value = result[name];
                        return (
                          <div className="sql-query-result-table-cell" key={`${key}-${{index}}`} style={{width, maxWidth: width, minWidth: width}}>
                            <CellFormatter
                              collaborators={window.app.state.collaborators}
                              cellValue={value}
                              column={column}
                              getOptionColors={this.props.getOptionColors}
                              getUserCommonInfo={this.props.getUserCommonInfo}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {isLoading && <Loading />}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

RecordList.propTypes = {
  records: PropTypes.array,
  columns: PropTypes.array,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
};

export default RecordList;
