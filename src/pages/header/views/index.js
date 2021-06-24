import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewItem from './view-item';

class Views extends Component {

  constructor(props) {
    super(props);
    this.state = {
      scrollLeft: 0,
    };
    this.viewsScroll = null;
    this.views = [];
  }

  componentDidMount() {
    const { currentViewIdx } = this.props;
    this.selectView(currentViewIdx);
  }

  onViewsScroll = (event) => {
    this.setState({ scrollLeft: event.target.scrollLeft });
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
    let { offsetWidth, scrollWidth } = this.viewsScroll;
    if (left > offsetWidth) {
      this.viewsScroll.scrollLeft = left - offsetWidth;
      this.setState({ scrollLeft: left - offsetWidth });
    }
    this.tabsNavWidth = offsetWidth;
    this.tabsNavTotalWidth = scrollWidth;
  }

  render() {
    const { currentViewIdx, views } = this.props;
    const { scrollLeft } = this.state;
    return (
      <div className="sql-query-plugin-views-container">
        {scrollLeft > 0 && (
          <div className="sql-query-plugin-views-scroll-before"></div>
        )}
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
                exportView={this.props.exportView}
              />
            );
          })}
        </div>
        {scrollLeft + this.tabsNavWidth < this.tabsNavTotalWidth && (
          <div className="sql-query-plugin-views-scroll-after"></div>
        )}
      </div>
    );
  }
}

Views.propTypes = {
  currentViewIdx: PropTypes.number,
  views: PropTypes.array,
  onSelectView: PropTypes.func,
  deleteView: PropTypes.func,
  updateView: PropTypes.func,
  exportView: PropTypes.func,
};

export default Views;
