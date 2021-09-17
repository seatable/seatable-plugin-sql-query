import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { FORMULA_RESULT_TYPE } from 'dtable-sdk';
import { Loading, CellFormatter } from '../../../components';
import { PER_DISPLAY_COUNT, NOT_SUPPORT_COLUMN_TYPES, FILE_COLUMN_TYPES, FORMULA_COLUMN_TYPES } from '../../../constants';
import { getCellRecordWidth } from '../../../utils/common-utils';
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
    const tables = props.getTables();
    this.disPlayColumns = props.columns
      .filter(column => !NOT_SUPPORT_COLUMN_TYPES.includes(column.type))
      .map(column => {
        const { data, type } = column;
        const { result_type: resultType } = data || {};
        if (FORMULA_COLUMN_TYPES.includes(type) && resultType === FORMULA_RESULT_TYPE.COLUMN) {
          const { linked_table_id, display_column_key } = data;
          let display_column = null;
          try {
            const linkedTable = tables.find(table => table._id === linked_table_id);
            display_column = linkedTable.columns.find(column => column.key === display_column_key);
          } catch {
            display_column = null;
          }
          return {
            ...column,
            width: getCellRecordWidth(column),
            data: { ...data, display_column: display_column }
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
    const { isLoading, displayRecordsCount, isShowEnlargeFormatter, enlargeFormatterProps } = this.state;
    const displayResults = records.slice(0, displayRecordsCount);
    const totalWidth = this.disPlayColumns.reduce((cur, nextItem) => { return (cur + nextItem.width); }, 0);

    return (
      <Fragment>
        <div className="sql-query-result success">
          <div className="sql-query-result-container">
            <div className="sql-query-result-content" style={{ width: totalWidth }}>
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
                          const { key, name, width, type } = column;
                          const value = (result[name] || result[name] === 0) ? result[name] : result[key];
                          return (
                            <div
                              className="sql-query-result-table-cell"
                              key={`${key}-${{index}}`}
                              style={{width, maxWidth: width, minWidth: width}}
                              onDoubleClick={FILE_COLUMN_TYPES.includes(type) ? () => this.openEnlargeFormatter(column, value) : () => {}}
                            >
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
};

export default RecordList;
