import React from 'react';
import PropTypes from 'prop-types';
import { FormulaFormatter } from 'dtable-ui-component';
import { CellType } from 'dtable-utils';
import { getFormulaArrayValue, convertValueToDtableLongTextValue } from '../../utils/common-utils';

function DtableFormulaFormatter(props) {
  const { cellValue, column, containerClassName } = props;
  const { collaborators } = window.app.state;
  if (!cellValue && cellValue !== 0 && cellValue !== false) return props.renderEmptyFormatter();
  const { data } = column;
  const { array_type } = data;
  let value = cellValue;
  if (Array.isArray(cellValue)) {
    value = getFormulaArrayValue(cellValue);
    if (array_type === CellType.LONG_TEXT) {
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
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
};

export default DtableFormulaFormatter;
