import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { CELL_TYPE } from 'dtable-sdk';
import { Loading, CellFormatter, RecordExpandDialog } from '../../../components';
import { PER_DISPLAY_COUNT, FILE_COLUMN_TYPES } from '../../../constants';
import { getCellRecordWidth, getDisplayColumns } from '../../../utils/common-utils';
import EnlargeFormatter from '../../../components/formatter/enlarge-formatter';

import '../../../assets/css/records.css';

class RecordList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      displayRecordsCount: PER_DISPLAY_COUNT,
      isShowEnlargeFormatter: false,
      enlargeFormatterProps: {}
    };
    const displayColumns = getDisplayColumns(props.columns);
    this.displayColumns = displayColumns.map(column => {
      const { type } = column;
      if (type === CELL_TYPE.LINK) {
        const { data } = column;
        const { display_column_key, array_type, array_data } = data;
        const display_column = {
          key: display_column_key || '0000',
          type: array_type || CELL_TYPE.TEXT,
          data: array_data || null
        };
        return {
          ...column,
          width: getCellRecordWidth(column),
          data: { ...data, display_column }
        };
      }
      return {
        ...column,
        width: getCellRecordWidth(column)
      };
    });
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

  openEnlargeFormatter = (column, value) => {
    this.setState({
      isShowEnlargeFormatter: true,
      enlargeFormatterProps: { column, value }
    });
  }

  closeEnlargeFormatter = () => {
    this.setState({
      isShowEnlargeFormatter: false,
      enlargeFormatterProps: { }
    });
  }

  onOpenRecordExpandDialog = (record) => {
    this.setState({ isShowRecordExpandDialog: true, expandedRecord: record });
  }

  closeRecordExpandDialog = () => {
    this.setState({ isShowRecordExpandDialog: false, expandedRecord: {} });
  }


  render() {
    const { records } = this.props;
    if (!Array.isArray(records) || records.length === 0) {
      return (
        <div className="sql-query-result success">
          <div className="sql-query-result-none">
            {intl.get('There_are_no_records')}
          </div>
        </div>
      );
    }
    const recordsCount = records.length;
    const { isLoading, displayRecordsCount, isShowEnlargeFormatter, enlargeFormatterProps, isShowRecordExpandDialog, expandedRecord } = this.state;
    const displayRecords = records.slice(0, displayRecordsCount);
    const totalWidth = this.displayColumns.reduce((cur, nextItem) => { return (cur + nextItem.width); }, 0) + 90;
    const collaborators = window.app.state.collaborators;

    return (
      <Fragment>
        <div className="sql-query-result success">
          <div className="sql-query-result-container">
            <div className="sql-query-result-content" style={{ width: totalWidth }}>
              <div className="static-sql-query-result-content">
                <div className="sql-query-result-table-row">
                  <div className="sql-query-result-table-cell column index"></div>
                  {this.displayColumns.map(column => {
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
                  {displayRecords.map((record, index) => {
                    return (
                      <div className="sql-query-result-table-row" key={record._id || index}>
                        <div className="sql-query-result-table-cell index">
                          <div className="sql-query-row-index-container">
                            <div className="sql-query-row-index-content">{index + 1}</div>
                            <div className="sql-query-row-expand" onClick={() => this.onOpenRecordExpandDialog(record)}>
                              <i className="dtable-font dtable-icon-open"></i>
                            </div>
                          </div>
                        </div>
                        {this.displayColumns.map(column => {
                          const { key, name, width, type } = column;
                          const value = (record[name] || record[name] === 0) ? record[name] : record[key];
                          return (
                            <div
                              className="sql-query-result-table-cell"
                              key={`${key}-${{index}}`}
                              style={{width, maxWidth: width, minWidth: width}}
                              onDoubleClick={FILE_COLUMN_TYPES.includes(type) ? () => this.openEnlargeFormatter(column, value) : () => {}}
                            >
                              <CellFormatter
                                collaborators={collaborators}
                                cellValue={value}
                                column={column}
                                getOptionColors={this.props.getOptionColors}
                                getUserCommonInfo={this.props.getUserCommonInfo}
                                getCellValueDisplayString={this.props.getCellValueDisplayString}
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
              <div className="sql-query-result-count">
                <div className="position-absolute">
                  { recordsCount > 1 ? intl.get('xxx_records', { count: recordsCount }) : intl.get('1_record')}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isShowEnlargeFormatter && (
          <EnlargeFormatter { ...enlargeFormatterProps } closeEnlargeFormatter={this.closeEnlargeFormatter} />
        )}
        {isShowRecordExpandDialog &&
          <RecordExpandDialog
            record={expandedRecord}
            columns={this.displayColumns}
            collaborators={collaborators}
            closeRecordExpandDialog={this.closeRecordExpandDialog}
            getOptionColors={this.props.getOptionColors}
            getUserCommonInfo={this.props.getUserCommonInfo}
            openEnlargeFormatter={this.openEnlargeFormatter}
            getCellValueDisplayString={this.props.getCellValueDisplayString}
          />
        }
      </Fragment>
    );
  }
}

RecordList.propTypes = {
  records: PropTypes.array,
  columns: PropTypes.array,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getTables: PropTypes.func,
  getCellValueDisplayString: PropTypes.func,
};

export default RecordList;
