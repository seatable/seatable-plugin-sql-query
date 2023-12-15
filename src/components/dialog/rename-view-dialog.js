import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';

class RenameViewDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewName: props.viewName || '',
      errMessage: ''
    };
  }

  handleChange = (event) => {
    let { viewName } = this.state;
    let value = event.target.value;
    if (value === viewName) {
      return;
    } else {
      this.setState({ viewName: value });
    }
  };

  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleSubmit();
      return false;
    }
  };

  handleSubmit = () => {
    let { viewName } = this.state;
    viewName = viewName.trim();
    if (!viewName) {
      this.setState({ errMessage: 'Name_is_required' });
      return;
    }
    this.props.onRenameViewConfirm(viewName);
    this.props.onRenameViewCancel();
  };

  toggle = () => {
    this.props.onRenameViewCancel();
  };

  render() {
    const { viewName, errMessage } = this.state;

    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false}>
        <ModalHeader toggle={this.toggle}>
          {intl.get('Rename_view')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>{intl.get('Name')}</Label>
              <Input
                id="viewName"
                autoFocus={true}
                value={viewName}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
              />
            </FormGroup>
          </Form>
          {errMessage && <Alert color="danger" className="mt-2">{intl.get(errMessage)}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle}>{intl.get('Cancel')}</Button>
          <Button color="primary" onClick={this.handleSubmit}>{intl.get('Submit')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

RenameViewDialog.propTypes = {
  viewName: PropTypes.string,
  onRenameViewConfirm: PropTypes.func,
  onRenameViewCancel: PropTypes.func,
};

export default RenameViewDialog;
