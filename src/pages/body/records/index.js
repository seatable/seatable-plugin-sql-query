import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { CELL_TYPE } from 'dtable-sdk';
import { RecordExpandDialog } from '../../../components';
import { INDEX_COLUMN, PRIVATE_COLUMN_KEY_TYPE_MAP } from '../../../constants';
import { getCellRecordWidth, getDisplayColumns } from '../../../utils/common-utils';
import EnlargeFormatter from '../../../components/formatter/enlarge-formatter';
import Table from './table';

import '../../../assets/css/records.css';

class RecordList extends Component {

  constructor(props) {
    super(props);
    const frozenColumnsCount = 1;
    const displayColumns = getDisplayColumns(props.columns, true);
    this.state = {
      isLoading: false,
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
    const { isLoading, isShowEnlargeFormatter, enlargeFormatterProps, isShowRecordExpandDialog, expandedRecord } = this.state;
    const collaborators = window.app.state.collaborators;
    
    return (
      <Fragment>
        <div className="sql-query-result success">
          <div className="sql-query-result-container position-relative">
            <div className="sql-query-result-content">
              <Table
                isLoading={isLoading}
                records={records}
                columns={this.displayColumns}
                collaborators={collaborators}
                cellValueUtils={this.props.cellValueUtils}
                onOpenRecordExpandDialog={this.onOpenRecordExpandDialog}
                openEnlargeFormatter={this.openEnlargeFormatter}
                getOptionColors={this.props.getOptionColors}
                getUserCommonInfo={this.props.getUserCommonInfo}
              />
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
            cellValueUtils={this.props.cellValueUtils}
            closeRecordExpandDialog={this.closeRecordExpandDialog}
            getOptionColors={this.props.getOptionColors}
            getUserCommonInfo={this.props.getUserCommonInfo}
            openEnlargeFormatter={this.openEnlargeFormatter}
            currentTable={this.props.currentTable}
            getLinkTableID={this.props.getLinkTableID}
            getLinkedTableID={this.props.getLinkedTableID}
            getTableById={this.props.getTableById}
            getViewById={this.props.getViewById}
          />
        }
      </Fragment>
    );
  }
}

RecordList.propTypes = {
  records: PropTypes.array,
  columns: PropTypes.array,
  currentTable: PropTypes.object,
  cellValueUtils: PropTypes.object,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getTables: PropTypes.func,
  getLinkTableID: PropTypes.func,
  getLinkedTableID: PropTypes.func,
  getTableById: PropTypes.func,
  getViewById: PropTypes.func,
};

export default RecordList;
