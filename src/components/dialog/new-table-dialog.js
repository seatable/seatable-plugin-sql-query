import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button } from 'reactstrap';
import isHotkey from 'is-hotkey';

const NewTableDialog = (props) => {
  const { tableName: defaultName, getTables, onNewTableConfirm, onNewTableCancel } = props;
  const [tableName, setTableName] = useState(defaultName || '');
  const [errMessage, setErrMessage] = useState('');
  const tablesRef = useRef(getTables ? getTables() : []);
  const newInputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    let name = (tableName || '').trim();
    if (!name) {
      setErrMessage('Name_is_required');
      return;
    }
    if (name.indexOf('`') > -1) {
      setErrMessage('Name_cannot_contain_backtick');
      return;
    }
    if (name.includes('/')) {
      setErrMessage('Name_cannot_contain_slash');
      return;
    }
    if (name.includes('\\')) {
      setErrMessage('Name_cannot_contain_backslash');
      return;
    }
    const isExist = Array.isArray(tablesRef.current) && tablesRef.current.find(item => item && item.name === name);
    if (isExist) {
      setErrMessage('Table_xxx_exist');
      return;
    }
    onNewTableConfirm && onNewTableConfirm(name);
  }, [tableName, onNewTableConfirm]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isHotkey('enter', event)) {
        event.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [handleSubmit, tableName]);

  const handleChange = useCallback((event) => {
    const value = event.target.value;
    if (value === tableName) return;
    setTableName(value);
    setErrMessage('');
  }, [tableName]);

  const toggle = useCallback(() => {
    onNewTableCancel && onNewTableCancel();
  }, [onNewTableCancel]);

  return (
    <Modal isOpen toggle={toggle} autoFocus={false}>
      <ModalHeader toggle={toggle}>{intl.get('New_table')}</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label htmlFor="tableName">{intl.get('Name')}</Label>
            <Input
              id="tableName"
              value={tableName}
              innerRef={input => newInputRef.current = input}
              onChange={handleChange}
              autoFocus
            />
            <Input style={{ display: 'none' }} />
          </FormGroup>
        </Form>
        {errMessage && (
          <Alert color="danger" className="mt-2">
            {intl.get(errMessage, { name: (tableName || '').trim() })}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>{intl.get('Cancel')}</Button>
        <Button color="primary" onClick={handleSubmit}>{intl.get('Submit')}</Button>
      </ModalFooter>
    </Modal>
  );
};

NewTableDialog.propTypes = {
  tableName: PropTypes.string,
  getTables: PropTypes.func.isRequired,
  onNewTableConfirm: PropTypes.func,
  onNewTableCancel: PropTypes.func,
};

export default NewTableDialog;
