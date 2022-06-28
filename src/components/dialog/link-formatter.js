import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'dtable-ui-component';
import { CELL_TYPE } from 'dtable-sdk';
import { getTableHiddenColumnKeys } from '../../utils/common-utils';
import { LINK_UNSHOW_COLUMN_TYPE, LEFT_NAV, ROW_DETAIL_PADDING, ROW_DETAIL_MARGIN, EDITOR_PADDING } from '../../constants';
import { getColumnWidth } from '../../utils/utils';
import RowCard from './row-card';

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
      isShowEditor: false,
      isShowNewLinkedRecordDialog: false,
      displayValue: props.value || [],
      isLoading: true,
      linkedRecords: [],
      showLinksLen: DEFAULT_LINKS_NUMBER,
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
    this.tableID = table_id;
    this.otherTableID = other_table_id;
    this.currentTableID = this.props.getLinkTableID(currentTableId, table_id, other_table_id);
    this.linkedTableID = this.props.getLinkedTableID(currentTableId, table_id, other_table_id);
    this.linkedTable = this.props.getTableById(this.linkedTableID);
    this.linkedViewID = linkedViewID;

    if (!this.linkedTable) return;
    this.linkedView = linkedViewID ? this.props.getViewById(this.linkedTable.views, this.linkedViewID) : null;
    this.linkedTableColumns = this.getLinkedTableColumns();
    this.nameColumn = this.linkedTableColumns.find(column => column.key === '0000');
  }

  getLinkedTableColumns = () => {
    const { linkedTable, linkedViewID } = this;
    const unShowColumnKeys = getTableHiddenColumnKeys(linkedTable, linkedViewID);
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
          return { ...column, width: getColumnWidth(column), data: { ...data, display_column } }
        }
        return { ...column, width: getColumnWidth(column) };
      });
    return linkedTableColumns;
  }

  initLinkedRecords = () => {
    const { linkID, tableID, otherTableID } = this;
    const { record  } = this.props;
    const value = this.props.getLinkCellValue(linkID, tableID, otherTableID, record._id);
    const rocords = this.props.getRowsByID(this.linkedTableID, value)
    this.setState({rocords, isLoading: false});
  }

  getDisplayColumns = (nameColumn = { key: '0000' }) => {
    const innerWidth = window.innerWidth;
    const leftBar = 0;
    let remainWidth = (innerWidth - LEFT_NAV - leftBar - ROW_DETAIL_PADDING - ROW_DETAIL_MARGIN - 2) * 0.8333 - EDITOR_PADDING;
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
    this.setState({ showLinksLen: this.state.showLinksLen + DEFAULT_LINKS_NUMBER });
  }

  renderLinkRecords = () => {
    const { isLoading, showLinksLen } = this.state;
    if (isLoading) {
      return <Loading />;
    }

    const { rocords } = this.state;
    const columns = this.getDisplayColumns(this.nameColumn);
    const isHasMore = rocords.length >= showLinksLen;

    const newRecords = rocords.slice(0, showLinksLen);
    return (
      <>
        {newRecords.map((row, rowIdx) => {
          return (
            <RowCard
              key={`row-card-${rowIdx}`}
              isShowRemoveCardItemBtn={false}
              isHighlightRow={false}
              row={row}
              rowIdx={rowIdx}
              nameColumn={this.nameColumn}
              columns={columns}
              removeCardItem={this.removeLink}
              collaborators={this.props.collaborators}
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
  pageId: PropTypes.string.isRequired,
  value: PropTypes.array,
  tables: PropTypes.array.isRequired,
  expandedTable: PropTypes.object.isRequired,
  expandedRow: PropTypes.object.isRequired,
  column: PropTypes.object,
  getLinkTableID: PropTypes.func,
  getLinkedTableID: PropTypes.func,
  getTableById: PropTypes.func,
  getViewById: PropTypes.func,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
};

export default LinkFormatter;
