import React from 'react';
import PropTypes from 'prop-types';
import { debounce } from '../../../utils/utils';
import eventBus from '../../../utils/event-bus';

import './index.css';

class HorizontalScrollbar extends React.Component {

  isSelfScroll = true;

  componentDidMount() {
    this.unsubscribeScroll = eventBus.subscribe('horizontal-scroll', this.handleHorizontalScroll);
  }

  componentWillUnmount() {
    this.unsubscribeScroll();
  }

  handleHorizontalScroll = ({ scrollLeft }) => {
    if (!this.container) {
      return;
    }
    if (this.isSelfScroll) {
      this.isSelfScroll = false;
    }
    if (window.app.chromeMainVersion === '94') {
      debounce(this.setScrollLeft, 100)(scrollLeft);
      return;
    }
    this.setScrollLeft(scrollLeft);
  }

  setScrollLeft = (scrollLeft) => {
    this.isSelfScroll = false;
    this.container.scrollLeft = scrollLeft;
  }

  onScroll = (event) => {
    // only update scrollLeft via scroll by itself.
    // e.g. forbid to update scrollLeft when the scrollbar's scrollLeft changed by other component
    event.stopPropagation();
    if (this.isSelfScroll) {
      this.props.onScrollbarScroll(event.target.scrollLeft);
      return;
    }
    this.isSelfScroll = true;
  }

  render() {
    const { canvasWidth } = this.props;
    if (!canvasWidth) return null;
    if (canvasWidth < window.innerWidth - 34) return null;

    return (
      <div
        className="horizontal-scrollbar"
        ref={ref => this.container = ref}
        onScroll={this.onScroll}
        style={{ width: window.innerWidth - 34 }}
      >
        <div
          className="horizontal-scrollbar-inner"
          style={{ width: canvasWidth }}
        ></div>
      </div>
    );
  }
}

HorizontalScrollbar.propTypes = {
  canvasWidth: PropTypes.number,
  onScrollbarScroll: PropTypes.func.isRequired,
};

export default HorizontalScrollbar;
