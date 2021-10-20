import React from 'react';
import PropTypes from 'prop-types';
import { FormulaFormatter as DtableFormulaFormatter } from 'dtable-ui-component';
import { FORMULA_RESULT_TYPE, CELL_TYPE } from 'dtable-sdk';
import { getFormulaArrayValue, convertValueToDtableLongTextValue } from '../../utils/common-utils';

function FormulaFormatter(props) {
  const { cellValue, column, collaborators, containerClassName } = props;
  if (!cellValue && cellValue !== 0) return props.renderEmptyFormatter();
  const { data } = column;
  const { result_type: resultType, array_type } = data;
  let value = cellValue;
  if (Array.isArray(cellValue)) {
    value = getFormulaArrayValue(cellValue);
    if (array_type === CELL_TYPE.DATE || resultType === FORMULA_RESULT_TYPE.DATE) {
      value = value.map(item => item.replace('T', ' ').replace('Z', ''));
    } else if (array_type === CELL_TYPE.LONG_TEXT) {
      value = value.map(item => convertValueToDtableLongTextValue(item));
    }
  } else {
    if (resultType === FORMULA_RESULT_TYPE.DATE) {
      value = value.replace('T', ' ').replace('Z', '');
    }
  }
  return (
    <DtableFormulaFormatter
      value={value}
      column={column}
      collaborators={collaborators}
      containerClassName={containerClassName}
    />
  );
}

FormulaFormatter.propTypes = {
  cellValue: PropTypes.any,
  column: PropTypes.object,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
};

export default FormulaFormatter;
