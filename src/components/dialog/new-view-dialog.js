import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button } from 'reactstrap';
import intl from 'react-intl-universal';
import isHotkey from 'is-hotkey';

class NewViewDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      viewName: '',
      errMessage: '',
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (event) => {
    if (isHotkey('enter', event)) {
      event.preventDefault();
      this.handleSubmit();
    }
  };

  handleChange = (event) => {
    let value = event.target.value;
    if (value === this.state.viewName) {
      return;
    }
    this.setState({ viewName: value });
  };

  toggle = () => {
    this.props.onNewViewCancel();
  };

  handleSubmit = () => {
    let { viewName } = this.state;
    viewName = viewName.trim();
    if (!viewName) {
      this.setState({ errMessage: 'Name_is_required' });
      return;
    }
    if (viewName.includes('/')) {
      this.setState({ errMessage: 'Name_cannot_contain_slash' });
      return;
    }
    if (viewName.includes('\\')) {
      this.setState({ errMessage: 'Name_cannot_contain_backslash' });
      return;
    }
    this.props.onNewViewConfirm(viewName);
    this.props.onNewViewCancel();
  };

  render() {
    const { viewName, errMessage } = this.state;

    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false}>
        <ModalHeader toggle={this.toggle}>{intl.get('New_view')}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="viewName">
                {intl.get('Name')}
              </Label>
              <Input
                id="viewName"
                value={viewName}
                innerRef={input => this.newInput = input}
                onChange={this.handleChange}
                autoFocus={true}
              />
              <Input style={{ display: 'none' }} />
            </FormGroup>
          </Form>
          {errMessage && <Alert color="danger" className="mt-2">{intl.get(errMessage)}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle}>
            {intl.get('Cancel')}
          </Button>
          <Button color="primary" onClick={this.handleSubmit}>
            {intl.get('Submit')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

NewViewDialog.propTypes = {
  onNewViewConfirm: PropTypes.func,
  onNewViewCancel: PropTypes.func,
};

export default NewViewDialog;
