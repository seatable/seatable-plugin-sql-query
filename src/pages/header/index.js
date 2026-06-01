import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import LOGO from '../../assets/images/sql-query.png';
import Views from './views';
import { NewViewDialog } from '../../components';
import { IconButton } from 'dtable-ui-component';

import '../../assets/css/header.css';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isNewViewDialogDisplay: false,
    };
  }

  openNewViewDialog = () => {
    this.setState({ isNewViewDialogDisplay: true });
  };

  closeNewViewDialog = () => {
    this.setState({ isNewViewDialogDisplay: false });
  };

  addView = (viewName) => {
    this.props.addView(viewName, () => {
      this.viewsRef.setViewsScrollLeft();
    });
  };

  render() {
    const { isNewViewDialogDisplay } = this.state;

    return (
      <Fragment>
        <div className="sql-query-plugin-header">
          <div className="sql-query-plugin-header-left mr-9">
            <img src={LOGO} alt="logo" width="24" />
            <span className="ml-2">{intl.get('SQL_query')}</span>
          </div>
          <div className="sql-query-plugin-header-center mr-9">
            <Views {...this.props} ref={ref => this.viewsRef = ref}/>
            <IconButton
              icon='add-table'
              title={intl.get('New_view')}
              onClick={this.openNewViewDialog}
            />
          </div>
          <IconButton
            icon='x'
            title={intl.get('Close')}
            onClick={this.props.onCloseToggle}
          />
        </div>
        {isNewViewDialogDisplay && (
          <NewViewDialog
            onNewViewConfirm={this.addView}
            onNewViewCancel={this.closeNewViewDialog}
          />
        )}
      </Fragment>
    );
  }
  
}

Header.propTypes = {
  currentViewIdx: PropTypes.number,
  views: PropTypes.array,
  addView: PropTypes.func,
  onCloseToggle: PropTypes.func,
  onSelectView: PropTypes.func,
};

export default Header;
