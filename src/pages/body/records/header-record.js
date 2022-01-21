import React from 'react';
import PropTypes from 'prop-types';
import Field from './field';

function HeaderRecord(props) {
  const { fields } = props;
  let totalWidth = 0;
  return (
    <div className="sql-query-result-table-row sql-query-result-table-header-row">
      {fields.map(column => {
        let style = {};
        let className = '';
        if (column.isFrozen) {
          style['position'] = 'sticky';
          style['left'] = totalWidth;
          totalWidth += column.width;
          className = 'sql-query-result-table-fix-left-cell ';
        }
        if (column.isFrozen && column.isLastFrozen) {
          className = className + 'sql-query-result-table-last-fix-left-cell';
        }
        return (
          <Field
            key={`${column.key}-row--1`}
            className={className}
            style={style}
            field={column}
          />
        );
      })}
    </div>
  );
}

HeaderRecord.propTypes = {
  fields: PropTypes.array,
};

export default HeaderRecord;
