import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, Label } from 'reactstrap';
import intl from 'react-intl-universal';
import { CellType } from 'dtable-utils';
import Formatter from '../formatter';
import { FILE_COLUMN_TYPES } from '../../constants/download-file';
import LinkFormatter from './link-formatter';

import '../../assets/css/record-expand-dialog.css';

class RecordExpandDialog extends Component {

  getDialogStyle = () => {
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    return {
      width: 720,
      maxWidth: 720,
      marginLeft: (innerWidth - 720) / 2,
      height: innerHeight - 56,
    };
  };

  toggle = () => {
    this.props.closeRecordExpandDialog();
  };

  openEnlargeFormatter = (column, value) => {
    this.props.openEnlargeFormatter && this.props.openEnlargeFormatter(column, value);
  };

  render() {
    const { record, columns } = this.props;
    return (
      <Modal
        isOpen={true}
        toggle={this.toggle}
        className="sql-query-plugin-record-expand-dialog"
        style={this.getDialogStyle()}
      >
        <ModalHeader toggle={this.toggle} >
          <span>{intl.get('Record_details')}</span>
        </ModalHeader>
        <ModalBody>
          {columns.map((column, index) => {
            const { key, name, type } = column;
            const value = record[name] || record[key];
            return (
              <div
                className="sql-query-record-expand-item"
                key={key}
                onDoubleClick={FILE_COLUMN_TYPES.includes(type) ? () => this.openEnlargeFormatter(column, value) : () => {}}
              >
                <div className="d-flex justify-content-between">
                  <Label>{name}</Label>
                </div>
                {type === CellType.LINK &&
                  <LinkFormatter
                    column={column}
                    record={record}
                    cellValueUtils={this.props.cellValueUtils}
                    currentTable={this.props.currentTable}
                    getTableById={this.props.getTableById}
                    getViewById={this.props.getViewById}
                  />
                }
                {type !== CellType.LINK &&
                  <Formatter
                    isSample={false}
                    column={column}
                    cellValue={value}
                    cellValueUtils={this.props.cellValueUtils}
                    empty={{
                      component: <div className="sql-query-record-expand-empty"></div>
                    }}
                    getUserCommonInfo={this.props.getUserCommonInfo}
                  />
                }
              </div>
            );
          })}
        </ModalBody>
      </Modal>
    );
  }
}

RecordExpandDialog.propTypes = {
  record: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  currentTable: PropTypes.object,
  cellValueUtils: PropTypes.object,
  closeRecordExpandDialog: PropTypes.func.isRequired,
  getUserCommonInfo: PropTypes.func.isRequired,
  openEnlargeFormatter: PropTypes.func,
  getTableById: PropTypes.func,
  getViewById: PropTypes.func,
};

export default RecordExpandDialog;
