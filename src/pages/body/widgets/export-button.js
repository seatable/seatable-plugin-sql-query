import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import intl from 'react-intl-universal';

class ExportButton extends Component {

  constructor(props) {
    super(props);
    this.exportButtonRef = React.createRef();
  }

  render() {
    return (
      <Fragment>
        <div
          className="query-sql-button query-sql-export-button"
          ref={this.exportButtonRef}
          onClick={this.props.export}
        >
          <i className="dtable-font dtable-icon-export-to-new-table"></i>
        </div>
        <UncontrolledTooltip placement="bottom" target={this.exportButtonRef} fade={false}>
          {intl.get('Export_to_a_new_table')}
        </UncontrolledTooltip>
      </Fragment>
    );
  }
}

ExportButton.propTypes = {
  export: PropTypes.func,
};

export default ExportButton;
