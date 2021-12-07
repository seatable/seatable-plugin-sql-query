import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ViewItem from './view-item';

const SCROLL_TYPE = {
  PREV: 'prev',
  NEXT: 'next',
};

class Views extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canScrollPrev: false,
      canScrollNext: false,
      canViewsScroll: true,
    };
    this.viewsScroll = null;
    this.views = [];
  }

  componentDidMount() {
    const { currentViewIdx } = this.props;
    this.checkAvailableScrollType();
    this.selectView(currentViewIdx);
  }

  checkAvailableScrollType = () => {
    const { canScrollPrev, canScrollNext } = this.state;
    let { offsetWidth, scrollWidth, scrollLeft } = this.viewsScroll;
    let _canScrollPrev = false;
    let _canScrollNext = false;
    if (scrollLeft > 0) {
      _canScrollPrev = true;
    }
    if (scrollLeft + offsetWidth < scrollWidth) {
      _canScrollNext = true;
    }

    if (_canScrollPrev !== canScrollPrev || _canScrollNext !== canScrollNext) {
      this.setState({
        canScrollPrev: _canScrollPrev,
        canScrollNext: _canScrollNext,
      });
    }
  }

  onScrollWithControl = (type) => {
    const { offsetWidth, scrollWidth, scrollLeft } = this.viewsScroll;
    let targetScrollLeft;
    if (type === SCROLL_TYPE.PREV) {
      if (scrollLeft === 0) {
        return;
      }
      targetScrollLeft = scrollLeft - offsetWidth;
      targetScrollLeft = targetScrollLeft > 0 ? targetScrollLeft : 0;
    }

    if (type === SCROLL_TYPE.NEXT) {
      if (scrollLeft + offsetWidth === scrollWidth) {
        return;
      }
      targetScrollLeft = scrollLeft + offsetWidth;
      targetScrollLeft = targetScrollLeft > scrollWidth - offsetWidth ? scrollWidth - offsetWidth : targetScrollLeft;
    }
    if (this.state.canViewsScroll) {
      this.setState({ canViewsScroll: false });
      let timer = null;
      timer = setInterval(() => {
        let step = (targetScrollLeft - scrollLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        this.viewsScroll.scrollLeft = this.viewsScroll.scrollLeft + step;
        if (Math.abs(targetScrollLeft - this.viewsScroll.scrollLeft) <= Math.abs(step)) {
          this.viewsScroll.scrollLeft = targetScrollLeft;
          clearInterval(timer);
          this.setState({ canViewsScroll: true });
        }
      }, 15);
    }
  }

  onViewsScroll = () => {
    this.checkAvailableScrollType();
  }

  setViewsScrollLeft = () => {
    if (!this.viewsScroll) return;
    const { offsetWidth, scrollWidth } = this.viewsScroll;
    if (scrollWidth > offsetWidth) {
      this.viewsScroll.scrollLeft = scrollWidth - offsetWidth;
    }
  }

  onSelectView = (id, viewIdx) => {
    if (viewIdx === this.props.currentViewIdx) return;
    this.props.onSelectView(id);
  }

  setViews = (idx, viewItem) => {
    this.views[idx] = viewItem;
  }

  selectView = (currentViewIdx) => {
    // get current view's distance with container's left
    let { left } = this.views[currentViewIdx].getBoundingClientRect();

    // get container's view with and total width
    let { offsetWidth } = this.viewsScroll;
    if (left > offsetWidth) {
      this.viewsScroll.scrollLeft = left - offsetWidth;
    }
  }

  render() {
    const { currentViewIdx, views } = this.props;
    const { canScrollPrev, canScrollNext, } = this.state;
    return (
      <Fragment>
        <div className="sql-query-plugin-views-container">
          <div
            className="sql-query-plugin-views-content"
            ref={ref => this.viewsScroll = ref}
            onScroll={this.onViewsScroll}
          >
            {views.map((view, viewIdx) => {
              const { _id: id } = view;
              const isSelect = viewIdx === currentViewIdx;
              return (
                <ViewItem 
                  key={`sql-query-view-${id}`}
                  isSelect={isSelect}
                  view={view}
                  onSelectView={() => this.onSelectView(id, viewIdx)}
                  setViewItem={(view) => this.setViews(viewIdx, view)}
                  deleteView={this.props.deleteView}
                  updateView={this.props.updateView}
                />
              );
            })}
          </div>
        </div>
        {(canScrollPrev || canScrollNext) &&
          <div className="views-scroll-control">
            <span
              className={`scroll-control-btn scroll-prev ${canScrollPrev && 'scroll-active'}`}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.PREV)}
            >
              <i className="dtable-font dtable-icon-left-slide btn-scroll-icon" />
            </span>
            <span
              className={`scroll-control-btn scroll-next ${canScrollNext && 'scroll-active'}`}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.NEXT)}
            >
              <i className="dtable-font dtable-icon-right-slide btn-scroll-icon" />
            </span>
          </div>
        }
      </Fragment>
    );
  }
}

Views.propTypes = {
  currentViewIdx: PropTypes.number,
  views: PropTypes.array,
  onSelectView: PropTypes.func,
  deleteView: PropTypes.func,
  updateView: PropTypes.func,
};

export default Views;
