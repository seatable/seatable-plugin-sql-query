import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loading } from '../../../components';
import Record from './record';
import HeaderRecord from './header-record';
import FooterRecord from './footer-record';
import HorizontalScrollbar from '../../../components/scrollbar/horizontal-scrollbar';
import VerticalScrollbar from '../../../components/scrollbar/vertical-scrollbar';
import { addClassName, removeClassName } from '../../../utils/common-utils';
import { PER_DISPLAY_COUNT } from '../../../constants';
import eventBus from '../../../utils/event-bus';
import { getColOverScanEndIdx, getColOverScanStartIdx, getVisibleColumnsBoundary } from '../../../utils/viewport-utils';
import { isFrozenColumn } from '../../../utils/column-metrics';

const RENDER_MORE_NUMBER = 10;
const RECORD_DEFAULT_HEIGHT = 33;

class Table extends Component {

  constructor(props) {
    super(props);
    const initScrollState = this.getHorizontalScrollState({ ...props, scrollLeft: 0 });
    this.state = {
      isLoading: props.isLoading,
      displayRecordsCount: PER_DISPLAY_COUNT,
      sqlQueryResultContentRef: null,
      rowOverScanStartIdx: 0,
      rowOverScanEndIdx: this.getRowOverScanEndIndex(props),
      ...initScrollState,
    };
    this.currScrollLeft = 0;
    this.currScrollTop = 0;
  }

  componentDidUpdate(prevProps) {
    if (this.props.gridWidth !== prevProps.gridWidth) {
      this.updateHorizontalScrollState({ ...this.props, scrollLeft: this.currScrollLeft });
    }
  }

  getHorizontalScrollState = ({ columnsMetrics, gridWidth, scrollLeft }) => {
    const { columns, lastFrozenColumnIndex } = columnsMetrics;
    const columnsLength = columns.length;
    const { colVisibleStartIdx, colVisibleEndIdx } = getVisibleColumnsBoundary(columns, lastFrozenColumnIndex, scrollLeft, gridWidth);
    const colOverScanStartIdx = getColOverScanStartIdx(colVisibleStartIdx, lastFrozenColumnIndex);
    const colOverScanEndIdx = getColOverScanEndIdx(colVisibleEndIdx, columnsLength);
    return { colOverScanStartIdx, colOverScanEndIdx };
  }

  getRowOverScanEndIndex = ({ records }) => {
    const { gridHeight } = this.props;
    const recordHeight = RECORD_DEFAULT_HEIGHT;
    const recordsCount = records.length;
    return Math.min(Math.ceil(gridHeight / recordHeight) + RENDER_MORE_NUMBER, recordsCount);
  }

  updateHorizontalScrollState = ({ columnsMetrics, gridWidth, scrollLeft }) => {
    const scrollState = this.getHorizontalScrollState({ columnsMetrics, gridWidth, scrollLeft });
    this.setState(scrollState);
  }

  handleScrollLeft = (scrollLeft) => {
    this.currScrollLeft = scrollLeft;
    this.updateHorizontalScrollState({ ...this.props, scrollLeft });
  }

  handleScrollTop = (scrollTop) => {
    this.currScrollTop = scrollTop;
    const { records } = this.props;
    const { gridHeight } = this.props;
    const recordHeight = RECORD_DEFAULT_HEIGHT;
    const recordsCount = records.length;
    const nextRowOverScanStartIdx = Math.max(0, Math.floor(scrollTop / recordHeight) - RENDER_MORE_NUMBER);
    const nextRowOverScanEndIdx = Math.min(Math.ceil((scrollTop + gridHeight) / recordHeight) + RENDER_MORE_NUMBER, recordsCount);
    if (Math.abs(nextRowOverScanStartIdx - this.state.rowOverScanStartIdx) > 5 || nextRowOverScanStartIdx < 5) {
      this.setState({ rowOverScanStartIdx: nextRowOverScanStartIdx });
    }
    if (Math.abs(nextRowOverScanEndIdx - this.state.rowOverScanEndIdx) > 5 || nextRowOverScanEndIdx > recordsCount - 5) {
      this.setState({ rowOverScanEndIdx: nextRowOverScanEndIdx });
    }
  }

  getDisplayColumns = () => {
    const { columns } = this.props.columnsMetrics;
    const { colOverScanStartIdx, colOverScanEndIdx } = this.state;
    const frozenColumns = columns.filter((column) => isFrozenColumn(column));
    const nonFrozenColumn = columns.slice(colOverScanStartIdx, colOverScanEndIdx + 1).filter((column) => !isFrozenColumn(column));
    return frozenColumns.concat(nonFrozenColumn);
  }

  getMoreResults = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const scrollTop = e.target.scrollTop;
    const originClassName = this.sqlQueryResultContainerRef.className;
    let newClassName;
    if (scrollLeft > 0) {
      newClassName = addClassName(originClassName, 'sql-query-result-content-scroll-left');
    } else {
      newClassName = removeClassName(originClassName, 'sql-query-result-content-scroll-left');
    }
    if (newClassName !== originClassName) {
      this.sqlQueryResultContainerRef.className = newClassName;
    }
    if (scrollLeft !== this.currScrollLeft) {
      this.handleScrollLeft(scrollLeft);
    }
    if (scrollTop !== this.currScrollTop) {
      this.handleScrollTop(scrollTop);
    }

    this.dispatchHorizontalScrollbarScroll(scrollLeft);
    this.dispatchVerticalScrollbarScroll(scrollTop);
    const { isLoading, displayRecordsCount } = this.state;
    const { records } = this.props;
    if (isLoading) return;
    if (displayRecordsCount >= records.length) return;
    if (this.sqlQueryResultContainerRef.offsetHeight + scrollTop >= this.sqlQueryResultContentRef.offsetHeight) {
      this.setState({ isLoading: true }, () => {
        this.setState({ isLoading: false, displayRecordsCount: displayRecordsCount + PER_DISPLAY_COUNT });
      });
    }
  }

  dispatchHorizontalScrollbarScroll = (scrollLeft) => {
    if (!this.horizontalScrollbar) return;
    if (!this.isHorizontalScrollByScrollbar) {
      eventBus.dispatch('horizontal-scroll', { scrollLeft });
      return;
    }
    this.isHorizontalScrollByScrollbar = false;
  }

  dispatchVerticalScrollbarScroll = (scrollTop) => {
    if (!this.verticalScrollbar) return;
    if (!this.isVerticalScrollByScrollbar) {
      eventBus.dispatch('vertical-scroll', { scrollTop });
      return;
    }
    this.isVerticalScrollByScrollbar = false;
  }

  onHorizontalScrollbarScroll = (scrollLeft) => {
    this.isHorizontalScrollByScrollbar = true;
    this.setScrollLeft(scrollLeft);
  }

  onVerticalScrollbarScroll = (scrollTop) => {
    this.isVerticalScrollByScrollbar = true;
    this.setScrollTop(scrollTop);
  }

  setScrollLeft = (scrollLeft) => {
    this.sqlQueryResultContainerRef.scrollLeft = scrollLeft;
  }

  setScrollTop = (scrollTop) => {
    this.sqlQueryResultContainerRef.scrollTop = scrollTop;
  }

  setContainerRef = (ref) => {
    this.sqlQueryResultContainerRef = ref;
  }

  setContentRef = (ref) => {
    this.sqlQueryResultContentRef = ref;
    this.setState({ sqlQueryResultContentRef: ref });
  }

  renderRecords = ({ displayColumns }) => {
    const { records } = this.props;
    const { rowOverScanStartIdx, rowOverScanEndIdx } = this.state;
    const recordHeight = RECORD_DEFAULT_HEIGHT;
    const recordsCount = records.length;
    const displayRecords = records.slice(rowOverScanStartIdx, rowOverScanEndIdx);
    const upperHeight = rowOverScanStartIdx * recordHeight;
    const belowHeight = (recordsCount - rowOverScanEndIdx) * recordHeight;
    const recordsDOMS = displayRecords.map((record, index) => {
      const recordIndex = rowOverScanStartIdx + index;
      return (
        <Record
          key={recordIndex._id || recordIndex}
          columns={displayColumns}
          record={record}
          index={recordIndex}
          collaborators={this.props.collaborators}
          cellValueUtils={this.props.cellValueUtils}
          openEnlargeFormatter={this.props.openEnlargeFormatter}
          getUserCommonInfo={this.props.getUserCommonInfo}
          getOptionColors={this.props.getOptionColors}
          onOpenRecordExpandDialog={this.props.onOpenRecordExpandDialog}
        />
      );
    });

    if (upperHeight > 0) {
      const style = { height: upperHeight, width: '100%', padding: 16 };
      const upperRow = <div key="upper-placeholder" className="d-flex align-items-end" style={style}><Loading /></div>;
      recordsDOMS.unshift(upperRow);
    }

    // add bottom placeholder
    if (belowHeight > 0) {
      const style = { height: belowHeight, width: '100%', padding: 16 };
      const belowRow = <div key="below-placeholder" className='d-flex align-items-start'  style={style}><Loading /></div>;
      recordsDOMS.push(belowRow);
    }
    return recordsDOMS;
  }

  render() {
    const { records, columns, columnsMetrics } = this.props;
    const recordsCount = records.length;
    const { isLoading, sqlQueryResultContentRef } = this.state;
    const totalWidth = columns.reduce((cur, nextItem) => { return (cur + nextItem.width); }, 0);
    const { totalColumnsWidth } = columnsMetrics;
    const displayColumns = this.getDisplayColumns();

    return (
      <div className="sql-query-result-table-content" onScroll={this.getMoreResults} ref={this.setContainerRef}>
        <div className="sql-query-result-table" ref={this.setContentRef} style={{ width: totalWidth }}>
          <HeaderRecord columns={displayColumns} />
          {this.renderRecords({ displayColumns })}
          <FooterRecord recordsCount={recordsCount} width={totalColumnsWidth} />
        </div>
        {sqlQueryResultContentRef && (
          <VerticalScrollbar
            containerHeight={this.sqlQueryResultContainerRef.offsetHeight}
            contentHeight={33 * records.length}
            ref={ref => this.verticalScrollbar = ref}
            onScrollbarScroll={this.onVerticalScrollbarScroll}
          />
        )}
        {sqlQueryResultContentRef && (
          <HorizontalScrollbar
            canvasWidth={totalWidth}
            ref={ref => this.horizontalScrollbar = ref}
            onScrollbarScroll={this.onHorizontalScrollbarScroll}
          />
        )}
        {isLoading && <Loading />}
      </div>
    );
  }
}

Table.propTypes = {
  gridWidth: PropTypes.number,
  gridHeight: PropTypes.number,
  isLoading: PropTypes.bool,
  records: PropTypes.array,
  columns: PropTypes.array,
  collaborators: PropTypes.array,
  columnsMetrics: PropTypes.object,
  cellValueUtils: PropTypes.object,
  onOpenRecordExpandDialog: PropTypes.func,
  openEnlargeFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
};

export default Table;
