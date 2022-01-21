import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { CELL_TYPE } from 'dtable-sdk';
import { Loading, RecordExpandDialog } from '../../../components';
import { PER_DISPLAY_COUNT, INDEX_COLUMN, PRIVATE_COLUMN_KEY_TYPE_MAP } from '../../../constants';
import { getCellRecordWidth, getDisplayColumns, addClassName, removeClassName } from '../../../utils/common-utils';
import EnlargeFormatter from '../../../components/formatter/enlarge-formatter';
import Record from './record';
import HeaderRecord from './header-record';
import FooterRecord from './footer-record';

import '../../../assets/css/records.css';

class RecordList extends Component {

  constructor(props) {
    super(props);
    const frozenColumnsCount = 1;
    const displayColumns = getDisplayColumns(props.columns);
    this.state = {
      isLoading: false,
      displayRecordsCount: PER_DISPLAY_COUNT,
      isShowEnlargeFormatter: false,
      enlargeFormatterProps: {}
    };
    this.columns = displayColumns.map(column => { // Fix the type of private column
      const privateColumnKeyType = PRIVATE_COLUMN_KEY_TYPE_MAP[column.key];
      if (!privateColumnKeyType) return column;
      if (privateColumnKeyType !== column.type) return { ...column, type: privateColumnKeyType };
      return column;
    }).map(column => {
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
    this.displayColumns = [ INDEX_COLUMN ].concat(this.columns).map((column, columnIndex) => {
      return {
        ...column,
        isFrozen: columnIndex < frozenColumnsCount,
        isLastFrozen: columnIndex === frozenColumnsCount - 1,
      };
    });
    this.sqlQueryResultRef = null;
    this.sqlQueryResultContentRef = null;
  }

  getMoreResults = (e) => {
    const originClassName = this.sqlQueryResultContentRef.className;
    let newClassName;
    if (e.target.scrollLeft > 0) {
      newClassName = addClassName(originClassName, 'sql-query-result-content-scroll-left');
    } else {
      newClassName = removeClassName(originClassName, 'sql-query-result-content-scroll-left');
    }
    if (newClassName !== originClassName) {
      this.sqlQueryResultContentRef.className = newClassName;
    }
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
    const totalWidth = this.displayColumns.reduce((cur, nextItem) => { return (cur + nextItem.width); }, 0);
    const collaborators = window.app.state.collaborators;

    return (
      <Fragment>
        <div className="sql-query-result success">
          <div className="sql-query-result-container">
            <div className="sql-query-result-content">
              <div className="sql-query-result-table-content" onScroll={this.getMoreResults} ref={ref => this.sqlQueryResultContentRef = ref}>
                <div className="sql-query-result-table" ref={ref => this.sqlQueryResultRef = ref}>
                  <HeaderRecord columns={this.displayColumns} />
                  {displayRecords.map((record, index) => {
                    return (
                      <Record
                        key={record._id || index}
                        columns={this.displayColumns}
                        record={record}
                        index={index}
                        collaborators={collaborators}
                        onOpenRecordExpandDialog={this.onOpenRecordExpandDialog}
                        openEnlargeFormatter={this.openEnlargeFormatter}
                        getOptionColors={this.props.getOptionColors}
                        getUserCommonInfo={this.props.getUserCommonInfo}
                        getCellValueDisplayString={this.props.getCellValueDisplayString}
                      />
                    );
                  })}
                  <FooterRecord recordsCount={recordsCount} width={totalWidth} />
                </div>
                {isLoading && <Loading />}
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
            columns={this.columns}
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
