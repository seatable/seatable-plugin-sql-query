import React from 'react';
import PropTypes from 'prop-types';
import { FormulaFormatter as DtableFormulaFormatter } from 'dtable-ui-component';
import { FORMULA_RESULT_TYPE, CELL_TYPE } from 'dtable-sdk';
import { getFormulaArrayValue, convertValueToDtableLongTextValue } from '../../utils/common-utils';

function FormulaFormatter(props) {
  const { cellValue, column, tables, collaborators, containerClassName } = props;
  if (!cellValue && cellValue !== 0) return props.renderEmptyFormatter();
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
    } else if (linked_column_type === CELL_TYPE.LONG_TEXT) {
      value = cellValue.map(item => convertValueToDtableLongTextValue(item));
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
      tables={tables}
      collaborators={collaborators}
      containerClassName={containerClassName}
    />
  );
}

FormulaFormatter.propTypes = {
  cellValue: PropTypes.any,
  column: PropTypes.object,
  tables: PropTypes.array,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
};

export default FormulaFormatter;
