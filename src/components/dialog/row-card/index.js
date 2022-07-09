import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { CELL_TYPE } from 'dtable-sdk';
import Formatter from '../../formatter';

import './index.css';

class RowCard extends PureComponent {

  componentDidMount() {
    const { rowIdx, onRef } = this.props;
    onRef && onRef(this, rowIdx);
  }

  componentWillUpdate(nextProps) {
    const { onRef } = this.props;
    onRef && onRef(this, nextProps.rowIdx);
  }

  onSelectRow = (e) => {
    const { row } = this.props;
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();
    this.props.onSelectRow && this.props.onSelectRow(row);
  }

  linkRowRecord = () => {
    const { row, columns, formulaRows } = this.props;
    return columns.map((column, index) => {
      const { key, width, type } = column;
      let cellValue = row[key];
      if (type === CELL_TYPE.LINK|| type === CELL_TYPE.FORMULA || type === CELL_TYPE.LINK_FORMULA ) {
        cellValue = formulaRows[row._id][key];
      }
      return (
        <div
          key={`row-card-cell-value-${key}-${index}`}
          className="row-card-cell-value text-truncate d-flex align-items-center"
          style={{ minWidth: width, width: width, maxWidth: width }}
        >
          <Formatter
            isRowExpand={false}
            cellValue={cellValue}
            column={column}
            row={row}
            getOptionColors={this.props.getOptionColors}
            isSample={true}
            collaborators={this.props.collaborators}
            getCellValueDisplayString={this.props.getCellValueDisplayString}
          />
        </div>
      );
    });
  }

  removeCardItem = (e) => {
    e.stopPropagation();
    const { row } = this.props;
    this.props.closeSelect && this.props.closeSelect();
    this.props.removeCardItem && this.props.removeCardItem(row._id);
  }

  onScroll = (event) => {
    event.stopPropagation();
    const { setItemScrollLeft, rowIdx } = this.props;
    if (this.scrollActive) {
      this.scrollActive = false;
      return;
    }
    if (setItemScrollLeft) setItemScrollLeft(this.cardRecordsItemRef.scrollLeft, rowIdx);
  }

  setScrollLeft = (scrollLeft) => {
    this.scrollActive = true;
    this.cardRecordsItemRef.scrollLeft = scrollLeft;
  }

  getScrollLeft = () => {
    return this.cardRecordsItemRef.scrollLeft;
  }

  setCardRecordsItemRef = (ref) => {
    this.cardRecordsItemRef = ref;
  }

  render() {
    const { row, nameColumn, isShowRemoveCardItemBtn } = this.props;
    const cardItemClass = classnames('row-card-item position-relative d-flex', {'row-card-item-highlight': this.props.isHighlightRow});
    return (
      <div className={cardItemClass} onClick={this.onSelectRow}>
        <div className="row-card-item-container w-100">
          <div className="row-card-item-header w-100 align-items-center">
            <div className="row-card-item-name seatable-row-card-name h-100">
              <Formatter
                isRowExpand={false}
                cellValue={row[nameColumn.key]}
                column={nameColumn}
                row={row}
                getOptionColors={this.props.getOptionColors}
                collaborators={this.props.collaborators}
                getCellValueDisplayString={this.props.getCellValueDisplayString}
              />
            </div>
            {isShowRemoveCardItemBtn && (
              <span className="row-card-item-remove d-print-none" onClick={this.removeCardItem}>
                <i className="row-card-remove-icon dtable-font dtable-icon-x-"></i>
              </span>
            )}
          </div>
          <div className="row-card-item-content" onScroll={this.onScroll} ref={this.setCardRecordsItemRef}>
            <div className="d-inline-flex">
              {this.linkRowRecord()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

RowCard.propTypes = {
  isHighlightRow: PropTypes.bool,
  isShowRemoveCardItemBtn: PropTypes.bool,
  rowIdx: PropTypes.number,
  row: PropTypes.object,
  nameColumn: PropTypes.object,
  formulaRows: PropTypes.object,
  columns: PropTypes.array,
  collaborators: PropTypes.array,
  onSelectRow: PropTypes.func,
  removeCardItem: PropTypes.func,
  onRef: PropTypes.func,
  setItemScrollLeft: PropTypes.func,
  closeSelect: PropTypes.func,
  getOptionColors: PropTypes.func,
  getCellValueDisplayString: PropTypes.func,
};

export default RowCard;
