import React from 'react';
import PropTypes from 'prop-types';
import { INDEX_COLUMN_TYPE } from '../../../constants';

function Column(props) {
  const { column, className, style } = props;
  const { name, width, left, type } = column;

  return (
    <div
      className={`sql-query-result-table-cell column ${className} ${type === INDEX_COLUMN_TYPE ? 'index' : ''}`}
      style={{ ...style, width, maxWidth: width, minWidth: width, left }}
    >
      <div className="sql-query-result-column-content text-truncate">
        {type === INDEX_COLUMN_TYPE ? '' : name}
      </div>
    </div>
  );
}

Column.propTypes = {
  column: PropTypes.object.isRequired,
  className: PropTypes.string,
  style: PropTypes.object, 
};

export default Column;
