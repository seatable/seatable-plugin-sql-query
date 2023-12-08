import React from 'react';
import PropTypes from 'prop-types';
import { CellType, FORMULA_COLUMN_TYPES_MAP } from 'dtable-utils';
import { CellFormatter } from '../../../components';
import { INDEX_COLUMN_TYPE, FILE_COLUMN_TYPES } from '../../../constants';

function Record(props) {
  const { columns, record, index } = props;

  return (
    <div className="sql-query-result-table-row record-height-default">
      {columns.map((column) => {
        const { key, name, width, type, data, isFrozen, isLastFrozen, left } = column;
        let style = {};
        let className = 'sql-query-result-table-cell ';
        if (isFrozen) {
          style.position = 'sticky';
          style.zIndex = 1;
          style.left = left;
          className = className + 'sql-query-result-table-fix-left-cell ';
        }
        if (isFrozen && isLastFrozen) {
          className = className + 'sql-query-result-table-last-fix-left-cell ';
        }
        if (type === INDEX_COLUMN_TYPE) {
          return (
            <div
              key={`${key}-${{index}}`}
              className={`${className} index`}
              style={{ ...style, width, maxWidth: width, minWidth: width }}
            >
              <div
                className="sql-query-row-index-container"
                style={{ width, maxWidth: width, minWidth: width }}
              >
                <div className="sql-query-row-index-content">{index + 1}</div>
                <div className="sql-query-row-expand" onClick={() => props.onOpenRecordExpandDialog(record)}>
                  <i className="dtable-font dtable-icon-open"></i>
                </div>
              </div>
            </div>
          );
        }
        const value = record[name] || record[key];
        if (FORMULA_COLUMN_TYPES_MAP[type]) {
          className += 'sql-query-result-table-formula-cell ';
          const { array_type } = data || {};
          if (array_type === CellType.IMAGE || array_type === CellType.FILE) {
            className += 'sql-query-result-table-formula-image-cell';
          }
        } else {
          className += `sql-query-result-table-${type}-cell`;
        }
        return (
          <div
            key={`${key}-${{index}}`}
            className={className}
            style={{ ...style, width, maxWidth: width, minWidth: width, left }}
            onDoubleClick={FILE_COLUMN_TYPES.includes(type) ? () => props.openEnlargeFormatter(column, value) : () => {}}
          >
            <CellFormatter
              cellValue={value}
              column={column}
              cellValueUtils={props.cellValueUtils}
              getUserCommonInfo={props.getUserCommonInfo}
            />
          </div>
        );
      })}
    </div>
  );
}

Record.propTypes = {
  columns: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  cellValueUtils: PropTypes.object,
  openEnlargeFormatter: PropTypes.func,
  onOpenRecordExpandDialog: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
};

export default Record;
