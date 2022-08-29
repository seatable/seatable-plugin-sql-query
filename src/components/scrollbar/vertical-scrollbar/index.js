import React from 'react';
import PropTypes from 'prop-types';
import { debounce } from '../../../utils/utils';
import eventBus from '../../../utils/event-bus';

import './index.css';

class VerticalScrollbar extends React.Component {

  isSelfScroll = true;

  componentDidMount() {
    this.unsubscribeScroll = eventBus.subscribe('vertical-scroll', this.handleVerticalScroll);
  }

  componentWillUnmount() {
    this.unsubscribeScroll();
  }

  handleVerticalScroll = ({ scrollTop }) => {
    if (!this.container) return;
    if (this.isSelfScroll) {
      this.isSelfScroll = false;
    }
    if (window.app.chromeMainVersion === '94') {
      debounce(this.setScrollTop, 100)(scrollTop);
      return;
    }
    this.setScrollTop(scrollTop);
  }

  setScrollTop = (scrollTop) => {
    this.isSelfScroll = false;
    this.container.scrollTop = scrollTop;
  }

  onScroll = (event) => {
    // only update scrollTop via scroll by itself.
    // e.g. forbid to update scrollTop when the scrollbar's scrollTop changed by other component
    event.stopPropagation();
    if (this.isSelfScroll) {
      this.props.onScrollbarScroll(event.target.scrollTop);
      return;
    }
    this.isSelfScroll = true;
  }

  render() {
    const { containerHeight, contentHeight } = this.props;
    if (!containerHeight) return null;

    return (
      <div
        className="vertical-scrollbar"
        style={{ height: containerHeight - 65 }} // 65: header:33 + footer: 32
        ref={ref => this.container = ref}
        onScroll={this.onScroll}
      >
        <div
          className="vertical-scrollbar-inner"
          style={{ height: contentHeight }}
        ></div>
      </div>
    );
  }
}

VerticalScrollbar.propTypes = {
  containerHeight: PropTypes.number,
  contentHeight: PropTypes.number,
  onScrollbarScroll: PropTypes.func.isRequired,
};

export default VerticalScrollbar;
