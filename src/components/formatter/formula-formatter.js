import React from 'react';
import PropTypes from 'prop-types';
import { FORMULA_RESULT_TYPE } from 'dtable-sdk';
import { NumberFormatter, DateFormatter } from 'dtable-ui-component';
import CellFormatter from './index';

function FormulaFormatter(props) {
  const { value, containerClassName, column } = props;
  const { data: columnData } = column;
  const { result_type: resultType } = columnData;
  const className = `dtable-ui cell-formatter-container formula-formatter ${containerClassName}`;

  if (resultType === FORMULA_RESULT_TYPE.COLUMN) {
    const { display_column } = columnData || {};
    if (!display_column) return props.renderEmptyFormatter();
    return (
      <CellFormatter
        collaborators={window.app.state.collaborators}
        cellValue={value}
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
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func
};

export default FormulaFormatter;
