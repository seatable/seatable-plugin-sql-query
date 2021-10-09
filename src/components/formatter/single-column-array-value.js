import React from 'react';
import PropTypes from 'prop-types';
import { CELL_TYPE } from 'dtable-sdk';
import {
  MultipleSelectFormatter,
  NumberFormatter,
  DateFormatter,
  CTimeFormatter,
  MTimeFormatter,
  CheckboxFormatter,
  LongTextFormatter
} from 'dtable-ui-component';
import CollaboratorItemFormatter from './collaborator-item-formatter';

function SingleColumnArrayValue(props) {

  const { column, containerClassName, value, collaborators } = props;
  const cellValue = value.map(item => {
    const { display_value } = item;
    if (!Array.isArray(display_value) || display_value.length === 0) return display_value;
    return display_value.map(i => {
      const { display_value } = i;
      return display_value;
    });
  }).flat();
  if (!Array.isArray(cellValue) || cellValue.length === 0) return props.renderEmptyFormatter();
  /*
    export const DEFAULT = 'default';
    // export const IMAGE = 'image';
    // export const FILE = 'file';
    // export const MULTIPLE_SELECT = 'multiple-select';
    // export const COLLABORATOR = 'collaborator';
    export const LINK = 'link';
    export const FORMULA = 'formula';
    export const LINK_FORMULA = 'link-formula';
    export const BUTTON = 'button';
    export const RATE = 'rate';
  */
  const { type, data } = column;
  switch(type) {
    case CELL_TYPE.TEXT:
    case CELL_TYPE.AUTO_NUMBER:
    case CELL_TYPE.EMAIL:
    case CELL_TYPE.URL: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value) return null;
            return (
              <div key={`link-${type}-${index}`} className="sql-query-link-item">
                {value}
              </div>
            );
          })}
        </div>
      );
    }
    case CELL_TYPE.NUMBER: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value && value !== 0) return null;
            return <NumberFormatter
              key={`link-${type}-${index}`}
              containerClassName="sql-query-link-item"
              data={column.data || {}}
              value={value}
            />;
          })}
        </div>
      );
    }
    case CELL_TYPE.DATE: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value || typeof value !== 'string') return null;
            const { data } = column;
            const { format } = data || {};
            return <DateFormatter
              key={`link-${type}-${index}`}
              value={value.replace('T', ' ').replace('Z', '')}
              format={format}
              containerClassName="sql-query-link-item"
            />;
          })}
        </div>
      );
    }
    case CELL_TYPE.CTIME: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value) return null;
            return <CTimeFormatter
              key={`link-${type}-${index}`}
              value={value}
              containerClassName="sql-query-link-item"
            />;
          })}
        </div>
      );
    }
    case CELL_TYPE.MTIME: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value) return null;
            return <MTimeFormatter
              key={`link-${type}-${index}`}
              value={value}
              containerClassName="sql-query-link-item"
            />;
          })}
        </div>
      );
    }
    case CELL_TYPE.DURATION: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value) return null;
            return <div key={`link-${type}-${index}`} className="sql-query-link-item">
              {props.getDurationDisplayString(value, column.data)}
            </div>;
          })}
        </div>
      );
    }
    case CELL_TYPE.CREATOR:
    case CELL_TYPE.LAST_MODIFIER: {
      return (
        <div className="dtable-ui cell-formatter-container collaborator-formatter sql-query-collaborator-formatter">
          {cellValue.map((value, index) => {
            if (!value) return null;
            return <CollaboratorItemFormatter
              key={`link-${type}-${index}`}
              cellValue={value}
              collaborators={collaborators}
              getUserCommonInfo={props.getUserCommonInfo}
              renderEmptyFormatter={props.renderEmptyFormatter}
            />;
          })}
        </div>
      );
    }
    case CELL_TYPE.SINGLE_SELECT: {
      if (!cellValue || cellValue.length === 0) return props.renderEmptyFormatter();
      // const validCellValue = [ ...new Set(cellValue) ];
      const { options } = column.data || {};
      return <MultipleSelectFormatter value={cellValue} options={options || []} containerClassName={`sql-query-${type}-formatter`} />;
    }
    case CELL_TYPE.CHECKBOX: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            return <CheckboxFormatter
              key={`link-${type}-${index}`}
              value={Boolean(value)}
              containerClassName={`sql-query-${type}-item`}
            />;
          })}
        </div>
      );
    }
    case CELL_TYPE.GEOLOCATION: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value) return null;
            return (
              <div key={`link-${type}-${index}`} className="sql-query-link-item">
                {props.getGeolocationDisplayString(value, data)}
              </div>
            );
          })}
        </div>
      );
    }
    case CELL_TYPE.LONG_TEXT: {
      return (
        <div className={containerClassName}>
          {cellValue.map((value, index) => {
            if (!value) return null;
            return (
              <LongTextFormatter
                key={`link-${type}-${index}`}
                value={value}
                containerClassName={`sql-query-${type}-item`}
              />
            );
          })}
        </div>
      );
    }

    default: {
      return props.renderEmptyFormatter();
    }
  }
}


SingleColumnArrayValue.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.array,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getDurationDisplayString: PropTypes.func,
  getGeolocationDisplayString: PropTypes.func,
};

export default SingleColumnArrayValue;