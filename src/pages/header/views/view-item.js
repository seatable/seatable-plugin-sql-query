import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { DTableDropdownItem, DTableDropdownMenu } from 'dtable-ui-component';
import { RenameViewDialog } from '../../../components';

class ViewItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isDropdownMenuOpen: false,
      isRenameDialogOpen: false,
      menuPosition: {}
    };
    this.viewRef = null;
    this.enteredCounter = 0;
  }

  componentDidMount() {
    this.props.setViewItem(this.viewRef);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isSelect !== this.props.isSelect) {
      this.closeMenu();
    }
  }

  toggleDropdown = (event) => {
    event.stopPropagation && event.stopPropagation();
    let menuPosition;
    if (!this.state.isDropdownMenuOpen) {
      const { bottom, left } = this.viewRef.getBoundingClientRect();
      menuPosition = { position: 'fixed', top: bottom, left: left };
    }
    this.setState({ isDropdownMenuOpen: !this.state.isDropdownMenuOpen, menuPosition }, () => {
      if (this.state.isDropdownMenuOpen) {
        document.addEventListener('click', this.closeMenu);
      }
    });
  };

  closeMenu = () => {
    document.removeEventListener('click', this.closeMenu);
    this.setState({ isDropdownMenuOpen: false, menuPosition: {} });
  };

  openRenameViewDialog = () => {
    this.setState({ isRenameDialogOpen: true });
  };

  closeRenameViewDialog = () => {
    this.setState({ isRenameDialogOpen: false });
  };

  renameView = (viewName) => {
    this.props.updateView({ name: viewName });
  };

  deleteView = () => {
    this.props.deleteView();
  };

  onDragStart = (event) => {
    event.stopPropagation();
    let ref = this.itemRef;
    event.dataTransfer.setDragImage(ref, 10, 10);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', this.props.view._id);
  };

  onDragEnter = (event) => {
    event.stopPropagation();
    this.enteredCounter++;
  };

  onDragOver = (event) => {
    if (event.dataTransfer.dropEffect === 'copy') {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.setState({
      dropRelativePosition: event.nativeEvent.offsetX <= event.target.clientWidth / 2 ?
        'before' : 'after'
    });
  };

  onDragLeave = (event) => {
    event.stopPropagation();
    this.enteredCounter--;
    if (this.enteredCounter === 0) {
      this.setState({
        dropRelativePosition: ''
      });
    }
  };

  onDrop = (event) => {
    event.stopPropagation();
    event.preventDefault();

    this.enteredCounter = 0;
    const { dropRelativePosition } = this.state;
    this.setState({
      dropRelativePosition: ''
    });

    const droppedViewID = event.dataTransfer.getData('text/plain');
    const { _id } = this.props.view;
    if (droppedViewID === _id) {
      return;
    }
    this.props.onMoveView(droppedViewID, _id, dropRelativePosition);
  };

  render() {
    const { view, isSelect, canDelete } = this.props;
    const { name } = view;
    const { isDropdownMenuOpen, isRenameDialogOpen, menuPosition, dropRelativePosition } = this.state;
    return (
      <Fragment>
        <div
          ref={ref => this.itemRef = ref}
          draggable="true"
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
          className={`
          ${'view-item'}
          ${dropRelativePosition === 'before' ? 'view-item-can-drop-before' : ''}
          ${dropRelativePosition === 'after' ? 'view-item-can-drop-after' : ''}
        `}
        >
          <div
            className={`sql-query-plugin-view ${isSelect ? 'selected' : ''}`}
            onClick={this.props.onSelectView}
            ref={ref => this.viewRef = ref}
          >
            <div className="sql-query-plugin-view-name">{name}</div>
            {isSelect && (
              <div className="sql-query-plugin-view-toggle ml-2" onClick={this.toggleDropdown}>
                <i className="dtable-font dtable-icon-down3"></i>
              </div>
            )}
            {isDropdownMenuOpen && (
              <DTableDropdownMenu className="show sql-query-view-dropdown-menu" style={menuPosition}>
                <DTableDropdownItem onClick={this.openRenameViewDialog} icon={<i className="dtable-font dtable-icon-rename"></i>} content={intl.get('Rename_view')} />
                {canDelete && (<DTableDropdownItem onClick={this.deleteView} icon={<i className="dtable-font dtable-icon-delete"></i>} content={intl.get('Delete_view')} />)}
              </DTableDropdownMenu>
            )}
          </div>
        </div>
        {isRenameDialogOpen && (
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
  canDelete: PropTypes.bool,
  onSelectView: PropTypes.func,
  setViewItem: PropTypes.func,
  deleteView: PropTypes.func,
  updateView: PropTypes.func,
  onMoveView: PropTypes.func
};


export default ViewItem;
