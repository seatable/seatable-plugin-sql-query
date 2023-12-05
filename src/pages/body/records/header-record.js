import React from 'react';
import PropTypes from 'prop-types';
import Field from './column';

function HeaderRecord(props) {
  const { columns } = props;

  return (
    <div className="sql-query-result-table-row sql-query-result-table-header-row">
      {columns.map(column => {
        const { left } = column;
        let style = {};
        let className = '';
        if (column.isFrozen) {
          style.position = 'sticky';
          style.zIndex = 1;
          style.left = left;
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
            column={column}
          />
        );
      })}
    </div>
  );
}

HeaderRecord.propTypes = {
  columns: PropTypes.array,
};

export default HeaderRecord;
