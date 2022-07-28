import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'dtable-ui-component';
import { CELL_TYPE } from 'dtable-sdk';
import { getTableHiddenColumnKeys } from '../../utils/common-utils';
import { LINK_UNSHOW_COLUMN_TYPE } from '../../constants';
import { getColumnWidth } from '../../utils/utils';
import RowCard from './row-card';
import dtableDbAPI from '../../api/dtable-da-api';
import pluginContext from '../../plugin-context';

const DEFAULT_LINKS_NUMBER = 10;

class LinkFormatter extends Component {

  constructor(props) {
    super(props);
    this.linkID = '';
    this.currentTableID = '';
    this.linkedTableID = '';
    this.isMultiple = false;
    this.linkedViewID = '';

    this.linkedTable = null;
    this.linkedTableColumns = [];
    this.initLinkConfig(props);
    this.state = {
      isHasMore: true,
      isShowEditor: false,
      isShowNewLinkedRecordDialog: false,
      displayValue: props.value || [],
      isLoading: true,
      linkedRecords: [],
      showLinksLen: 10,
      filteredRows: [],
    };
  }

  componentDidMount() {
    this.initLinkedRecords();
  }

  initLinkConfig = (props) => {
    const { currentTable, column } = props;
    const currentTableId = currentTable._id;
    const { data } = column;
    const { table_id, other_table_id, link_id, is_row_from_view = false, other_view_id = '', is_multiple = true } = data || {};
    const linkedViewID = is_row_from_view ? other_view_id : '';
    this.linkID = link_id;
    this.isMultiple = is_multiple;
    this.currentTableID = this.props.getLinkTableID(currentTableId, table_id, other_table_id);
    this.linkedTableID = this.props.getLinkedTableID(currentTableId, table_id, other_table_id);
    this.linkedTable = this.props.getTableById(this.linkedTableID);
    this.linkedViewID = linkedViewID;

    if (!this.linkedTable) return;
    this.linkedTableColumns = this.getLinkedTableColumns();
    this.nameColumn = this.linkedTableColumns.find(column => column.key === '0000');
  }

  getLinkedTableColumns = () => {
    const { linkedTable, linkedViewID } = this;
    const { getViewById } = this.props;
    const unShowColumnKeys = getTableHiddenColumnKeys(linkedTable, linkedViewID, getViewById);
    const linkedTableColumns = linkedTable.columns
      .filter(column => {
        if (unShowColumnKeys.includes(column.key)) return false;
        if (LINK_UNSHOW_COLUMN_TYPE.includes(column.type)) return false;
        return true;
      })
      .map(column => {
        if (column.type === CELL_TYPE.LINK) {
          const { data } = column;
          const { display_column_key, array_type, array_data } = data;
          const display_column = {
            key: display_column_key || '0000',
            type: array_type || CELL_TYPE.TEXT,
            data: array_data || null
          };
          return { ...column, width: getColumnWidth(column), data: { ...data, display_column } };
        }
        return { ...column, width: getColumnWidth(column) };
      });
    return linkedTableColumns;
  }

  initLinkedRecords = () => {
    const { linkedTable } = this;
    const { record, column  } = this.props;
    const dtableUuid = pluginContext.getSetting('dtableUuid');
    const records = record[column.key] || [];
    const rowIds = records.map(item => item.row_id);
    this.listTableRowsByIds(dtableUuid, linkedTable.name, rowIds);
  }

  listTableRowsByIds = (dtableUuid, tableName, rowIds) => {
    if (!Array.isArray(rowIds) || rowIds.length === 0) {
      this.setState({ 
        isHasMore: false,
        isLoading: false,
      });
      return;
    }
    const { showLinksLen } = this.state;
    const { record } = this.props;
    dtableDbAPI.listTableRowsByIds(dtableUuid, tableName, rowIds).then(res => {
      const { metadata: columns, results: rows } = res.data;
      this.linkedTableViewRows = rows;
      const { filteredRows } = this.state;
      const newRows = filteredRows.concat(rows);
      this.linkedTableFormulaRows = this.getFormulaRowsFormArchivedRows(columns, newRows);
      const isHasMore = record._id && rows.length === DEFAULT_LINKS_NUMBER;
      this.setState({ filteredRows: newRows, 
        isHasMore,
        isLoading: false, 
        showLinksLen: showLinksLen + DEFAULT_LINKS_NUMBER,
      });
    });
  }

  loadMoreLinedRecords = () => {
    const { linkedTable } = this;
    const { showLinksLen } = this.state;
    const { record, column, currentTable } = this.props;
    const dtableUuid = pluginContext.getSetting('dtableUuid');
    const rowId = record._id;
    dtableDbAPI.listRowLinkedRecords(dtableUuid, currentTable._id, column.key, rowId, showLinksLen).then(res => {
      const records = res.data[rowId] || [];
      const rowIds = records.map(item => item.row_id);
      this.listTableRowsByIds(dtableUuid, linkedTable.name, rowIds);
    });
  }

  getFormulaRowsFormArchivedRows = (columns, rows) => {
    let formulaRows = {};
    const computedColumnTypes = [CELL_TYPE.LINK, CELL_TYPE.LINK_FORMULA, CELL_TYPE.FORMULA];
    const formulaColumns = columns.filter(column => computedColumnTypes.includes(column.type));
    if (formulaColumns.length > 0) {
      rows.forEach(row => {
        const rowId = row._id;
        formulaRows[row._id] = {};
        formulaColumns.forEach(column => formulaRows[rowId][column.key] = row[column.key]);
      }); 
    }
    return formulaRows;
  }

  getDisplayColumns = (nameColumn = { key: '0000' }) => {
    // const innerWidth = window.innerWidth;
    // const leftBar = 0;
    // let remainWidth = (innerWidth - LEFT_NAV - leftBar - ROW_DETAIL_PADDING - ROW_DETAIL_MARGIN - 2) * 0.8333 - EDITOR_PADDING;
    let displayColumns = [];
    this.linkedTableColumns.forEach(column => {
      if (column.key !== nameColumn.key) {
        // remainWidth = remainWidth - column.width - 16;
        displayColumns.push(column);
      }
    });
    return displayColumns;
  }

  onClickEllipsis = () => {
    this.loadMoreLinedRecords();
  }

  renderLinkRecords = () => {
    const { isLoading, isHasMore } = this.state;
    if (isLoading) {
      return <Loading />;
    }

    const { filteredRows } = this.state;
    const columns = this.getDisplayColumns(this.nameColumn);

    return (
      <>
        {filteredRows.map((row, rowIdx) => {
          return (
            <RowCard
              key={`row-card-${rowIdx}`}
              isShowRemoveCardItemBtn={false}
              isHighlightRow={false}
              row={row}
              rowIdx={rowIdx}
              nameColumn={this.nameColumn}
              columns={columns}
              cellValueUtils={this.props.cellValueUtils}
              removeCardItem={this.removeLink}
              collaborators={this.props.collaborators}
              formulaRows={this.linkedTableFormulaRows}
            />
          );
        })}
        {isHasMore && (
          <div className="sql-query-link-ellipsis" onClick={this.onClickEllipsis}>
            <i className="dtable-font dtable-icon-more-level"></i>
          </div>
        )}
      </>
    );
  }

  render() {
    if (!this.linkedTable) {
      return (
        <div className="seatable-app-universal-table-expand-link-formatter"></div>
      );
    }

    return (
      <div className="seatable-app-universal-table-expand-link-formatter">
        <div className="link-formatter-link-records-container">
          {this.renderLinkRecords()}
        </div>
      </div>
    );
  }
}

LinkFormatter.propTypes = {
  currentTable: PropTypes.object,
  record: PropTypes.object,
  value: PropTypes.array,
  collaborators: PropTypes.array,
  column: PropTypes.object,
  cellValueUtils: PropTypes.object,
  getLinkTableID: PropTypes.func,
  getLinkedTableID: PropTypes.func,
  getTableById: PropTypes.func,
  getViewById: PropTypes.func,
};

export default LinkFormatter;
