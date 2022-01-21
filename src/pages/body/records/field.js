import React from 'react';
import PropTypes from 'prop-types';
import { INDEX_COLUMN_TYPE } from '../../../constants';

function Field(props) {
  const { field, className, style } = props;
  const { name, width, type } = field;

  return (
    <div
      className={`sql-query-result-table-cell column ${className} ${type === INDEX_COLUMN_TYPE ? 'index': ''}`}
      style={{ ...style, width, maxWidth: width, minWidth: width }}
    >
      <div className="sql-query-result-column-content text-truncate">
        {type === INDEX_COLUMN_TYPE ? '' : name}
      </div>
    </div>
  );
}

Field.propTypes = {
  field: PropTypes.object.isRequired,
  className: PropTypes.string,
  style: PropTypes.object, 
};

export default Field;
