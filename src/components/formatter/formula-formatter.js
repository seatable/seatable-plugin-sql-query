import React from 'react';
import PropTypes from 'prop-types';
import { FORMULA_RESULT_TYPE } from 'dtable-sdk';
import { NumberFormatter, DateFormatter } from 'dtable-ui-component';


function FormulaFormatter(props) {
  const { value, containerClassName, column } = props;
  const { data: columnData } = column;
  const { result_type: resultType } = columnData;

  // need column data to format value
  if (resultType === FORMULA_RESULT_TYPE.COLUMN) return props.renderEmptyFormatter();

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
  let formattedValue = Object.prototype.toString.call(value) === '[object Boolean]' ? value + '' : value;

  return <div className={`dtable-ui cell-formatter-container formula-formatter ${containerClassName}`}>{formattedValue}</div>;
}

FormulaFormatter.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.any,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
};

export default FormulaFormatter;
