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

class Table extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: props.isLoading,
      displayRecordsCount: PER_DISPLAY_COUNT,
      sqlQueryResultContentRef: null,
    };
  }

  getMoreResults = () => {
    const originClassName = this.sqlQueryResultContainerRef.className;
    let newClassName;
    const { scrollLeft, scrollTop } = this.sqlQueryResultContainerRef;
    if (scrollLeft > 0) {
      newClassName = addClassName(originClassName, 'sql-query-result-content-scroll-left');
    } else {
      newClassName = removeClassName(originClassName, 'sql-query-result-content-scroll-left');
    }
    if (newClassName !== originClassName) {
      this.sqlQueryResultContainerRef.className = newClassName;
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

  render() {
    const { records, columns, collaborators } = this.props;
    const recordsCount = records.length;
    const { displayRecordsCount, isLoading, sqlQueryResultContentRef } = this.state;
    const displayRecords = records.slice(0, displayRecordsCount);
    const totalWidth = columns.reduce((cur, nextItem) => { return (cur + nextItem.width); }, 0);

    return (
      <div className="sql-query-result-table-content" onScroll={this.getMoreResults} ref={this.setContainerRef}>
        <div className="sql-query-result-table" ref={this.setContentRef}>
          <HeaderRecord columns={columns} />
          {displayRecords.map((record, index) => {
            return (
              <Record
                key={record._id || index}
                columns={columns}
                record={record}
                index={index}
                collaborators={collaborators}
                cellValueUtils={this.props.cellValueUtils}
                onOpenRecordExpandDialog={this.props.onOpenRecordExpandDialog}
                openEnlargeFormatter={this.props.openEnlargeFormatter}
                getOptionColors={this.props.getOptionColors}
                getUserCommonInfo={this.props.getUserCommonInfo}
              />
            );
          })}
          {sqlQueryResultContentRef && (
            <VerticalScrollbar
              containerHeight={this.sqlQueryResultContainerRef.offsetHeight}
              contentHeight={33 * displayRecords.length}
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
          <FooterRecord recordsCount={recordsCount} width={totalWidth} />
        </div>
        {isLoading && <Loading />}
      </div>
    );
  }
}

Table.propTypes = {
  isLoading: PropTypes.bool,
  records: PropTypes.array,
  columns: PropTypes.array,
  collaborators: PropTypes.array,
  cellValueUtils: PropTypes.object,
  onOpenRecordExpandDialog: PropTypes.func,
  openEnlargeFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
};

export default Table;
