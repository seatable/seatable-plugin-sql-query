import React from 'react';
import PropTypes from 'prop-types';
import { CELL_TYPE, FORMULA_RESULT_TYPE } from 'dtable-sdk';
import {
  MultipleSelectFormatter,
  NumberFormatter,
  DateFormatter,
  CTimeFormatter,
  MTimeFormatter,
  CheckboxFormatter,
  LongTextFormatter,
  FormulaFormatter
} from 'dtable-ui-component';
import CollaboratorItemFormatter from './collaborator-item-formatter';
import { getFormulaArrayValue } from '../../utils/common-utils';

function LinkFormatter(props) {
  const { column, value, containerClassName, collaborators, tables } = props;
  const { data } = column;
  if (!Array.isArray(value) || value.length === 0) return props.renderEmptyFormatter();
  let { display_column } = data || {};
  if (!display_column) return props.renderEmptyFormatter();
  const cellValue = getFormulaArrayValue(value);
  if (!Array.isArray(cellValue) || cellValue.length === 0) return props.renderEmptyFormatter();
  const { type, data: displayColumnData } = display_column;
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
              data={displayColumnData || {}}
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
            const { format } = displayColumnData || {};
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
              {props.getCellValueDisplayString(value, displayColumnData)}
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
      const { options } = displayColumnData || {};
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
                {props.getCellValueDisplayString(value, displayColumnData)}
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
    case CELL_TYPE.FORMULA:
    case CELL_TYPE.LINK_FORMULA: {
      if (!cellValue && cellValue !== 0) return this.renderEmptyFormatter();
      const { linked_column_type, linked_column_data, data } = column;
      const { result_type: resultType } = data;
      let value = cellValue;
      if (Array.isArray(cellValue)) {
        value = getFormulaArrayValue(cellValue);
        if (linked_column_type === CELL_TYPE.DATE || resultType === FORMULA_RESULT_TYPE.DATE) {
          value = value.map(item => item.replace('T', ' ').replace('Z', ''));
        } else if ((linked_column_type === CELL_TYPE.FORMULA || linked_column_type === CELL_TYPE.LINK_FORMULA)
          && linked_column_data.result_type === FORMULA_RESULT_TYPE.DATE) {
          value = value.map(item => item.replace('T', ' ').replace('Z', ''));
        }
      } else {
        if (resultType === FORMULA_RESULT_TYPE.DATE) {
          value = value.replace('T', ' ').replace('Z', '');
        }
      }
      return (
        <FormulaFormatter
          value={value}
          column={display_column}
          tables={tables}
          collaborators={collaborators}
          containerClassName={containerClassName}
        />
      );
    }

    default: {
      return props.renderEmptyFormatter();
    }
  }
}

LinkFormatter.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.any,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getCellValueDisplayString: PropTypes.func,
};

export default LinkFormatter;
