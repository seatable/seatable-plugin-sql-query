import React from 'react';
import PropTypes from 'prop-types';
import { FormulaFormatter } from 'dtable-ui-component';
import { CELL_TYPE } from 'dtable-sdk';
import { getFormulaArrayValue, convertValueToDtableLongTextValue } from '../../utils/common-utils';

function DtableFormulaFormatter(props) {
  const { cellValue, column, collaborators, containerClassName } = props;
  if (!cellValue && cellValue !== 0 && cellValue !== false) return props.renderEmptyFormatter();
  const { data } = column;
  const { array_type } = data;
  let value = cellValue;
  if (Array.isArray(cellValue)) {
    value = getFormulaArrayValue(cellValue);
    if (array_type === CELL_TYPE.LONG_TEXT) {
      value = value.map(item => convertValueToDtableLongTextValue(item));
    }
  }
  return (
    <FormulaFormatter
      value={value}
      column={column}
      collaborators={collaborators}
      containerClassName={containerClassName}
    />
  );
}

DtableFormulaFormatter.propTypes = {
  cellValue: PropTypes.any,
  column: PropTypes.object,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
};

export default DtableFormulaFormatter;
