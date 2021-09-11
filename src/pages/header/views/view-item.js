import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { RenameViewDialog } from '../../../components';

class ViewItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isRenameDialogDisplay: false,
      menuPosition: {}
    };
    this.viewRef = null;
  }

  componentDidMount() {
    this.props.setViewItem(this.viewRef);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isSelect !== this.props.isSelect) {
      this.closeMenu();
    }
  }

  toggleDropdown = () => {
    let menuPosition;
    if (!this.state.isOpen) {
      const { bottom, left } = this.viewRef.getBoundingClientRect();
      menuPosition = { position: 'fixed', top: bottom, left: left };
    }
    this.setState({ isOpen: !this.state.isOpen, menuPosition }, () => {
      if (this.state.isOpen) {
        document.addEventListener('click', this.closeMenu);
      }
    });
  }

  closeMenu = () => {
    document.removeEventListener('click', this.closeMenu);
    this.setState({ isOpen: false, menuPosition: {} });
  }

  openRenameViewDialog = () => {
    this.setState({ isRenameDialogDisplay: true });
  }

  closeRenameViewDialog = () => {
    this.setState({ isRenameDialogDisplay: false });
  }

  renameView = (viewName) => {
    this.props.updateView({ name: viewName });
  }

  deleteView = () => {
    this.props.deleteView();
  }

  exportView = () => {
    this.props.exportView();
  }

  render() {
    const { view, isSelect } = this.props;
    const { name } = view;
    const { isOpen, isRenameDialogDisplay, menuPosition } = this.state;
    return (
      <Fragment>
        <div
          className={`sql-query-plugin-view ${isSelect ? 'selected' : ''}`}
          onClick={this.props.onSelectView}
          ref={ref => this.viewRef = ref}
        >
          <div className="sql-query-plugin-view-name">{name}</div>
          {isSelect && (
            <div className="sql-query-plugin-view-toggle ml-2" onClick={this.toggleDropdown}>
              <i className="dtable-font dtable-icon-drop-down"></i>
            </div>
          )}
          {isOpen && (
            <div className="dropdown-menu large show sql-query-view-dropdown-menu" style={menuPosition}>
              <button className="dropdown-item sql-query-view-dropdown-item" onClick={this.openRenameViewDialog}>
                <i className="dtable-font dtable-icon-rename sql-query-view-item-icon"></i>
                <span>{intl.get('Rename_view')}</span>
              </button>
              <button className="dropdown-item sql-query-view-dropdown-item" onClick={this.exportView}>
                <i className="dtable-font dtable-icon-export-to-new-table sql-query-view-item-icon"></i>
                <span>{intl.get('Export_to_a_new_table')}</span>
              </button>
              <button className="dropdown-item sql-query-view-dropdown-item" onClick={this.deleteView}>
                <i className="dtable-font dtable-icon-delete sql-query-view-item-icon"></i>
                <span>{intl.get('Delete_view')}</span>
              </button>
            </div>
          )}
        </div>
        {isRenameDialogDisplay && (
          <RenameViewDialog
            viewName={name}
            onRenameViewConfirm={this.renameView}
            onRenameViewCancel={this.closeRenameViewDialog}
          />
        )}
      </Fragment>
    );
  }
}

ViewItem.propTypes = {
  isSelect: PropTypes.bool,
  view: PropTypes.object,
  onSelectView: PropTypes.func,
  setViewItem: PropTypes.func,
  deleteView: PropTypes.func,
  updateView: PropTypes.func,
  exportView: PropTypes.func,
};


export default ViewItem;
