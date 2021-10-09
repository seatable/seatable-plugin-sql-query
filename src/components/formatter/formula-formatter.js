import React from 'react';
import PropTypes from 'prop-types';
import { FORMULA_RESULT_TYPE } from 'dtable-sdk';
import { NumberFormatter, DateFormatter } from 'dtable-ui-component';
import CellFormatter from './index';
import { isArrayFormalColumn } from '../../utils/common-utils';
import SingleColumnArrayValue from './single-column-array-value';

function FormulaFormatter(props) {
  const { value, containerClassName, column, collaborators } = props;
  const { data: columnData } = column;
  const { result_type: resultType } = columnData;
  const className = `dtable-ui cell-formatter-container formula-formatter ${containerClassName}`;

  if (resultType === FORMULA_RESULT_TYPE.COLUMN) {
    const { display_column } = columnData || {};
    if (!display_column) return props.renderEmptyFormatter();
    if (!isArrayFormalColumn(display_column.type) && Array.isArray(value)) {
      return <SingleColumnArrayValue
        column={display_column}
        value={value}
        collaborators={collaborators}
        containerClassName="sql-query-link-formatter"
        renderEmptyFormatter={props.renderEmptyFormatter}
        getOptionColors={props.getOptionColors}
        getUserCommonInfo={props.getUserCommonInfo}
        getDurationDisplayString={props.getDurationDisplayString}
        getGeolocationDisplayString={props.getGeolocationDisplayString}
      />;
    }

    const cellValue = value
      .map(item => {
        const { display_value } = item;
        if (!Array.isArray(display_value) || display_value.length === 0) return display_value;
        return display_value.map(i => {
          if (Object.prototype.toString.call(i) === '[object Object]') {
            const { display_value } = i;
            return display_value;
          }
          return i;
        });
      })
      .flat()
      .filter(item => item);
    return (
      <CellFormatter
        collaborators={collaborators}
        cellValue={cellValue}
        column={display_column}
        getOptionColors={props.getOptionColors}
        getUserCommonInfo={props.getUserCommonInfo}
      />
    );
  }

  if (resultType === FORMULA_RESULT_TYPE.NUMBER) {
    if (!value && value !== 0) return props.renderEmptyFormatter();
    return <NumberFormatter value={value} data={columnData || {}} containerClassName={`${containerClassName} text-right`} />;
  }

  if (resultType === FORMULA_RESULT_TYPE.DATE) {
    if (!value) return props.renderEmptyFormatter();
    const { format } = columnData || {};
    return <DateFormatter value={value.replace('T', ' ').replace('Z', '')} format={format} containerClassName={containerClassName} />;
  }

  if (typeof value === 'object') return props.renderEmptyFormatter();
  const formattedValue = Object.prototype.toString.call(value) === '[object Boolean]' ? value + '' : value;

  return (<div className={className}>{formattedValue}</div>);
}

FormulaFormatter.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.any,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getDurationDisplayString: PropTypes.func,
  getGeolocationDisplayString: PropTypes.func,
};

export default FormulaFormatter;
