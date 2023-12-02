import React from 'react';
import PropTypes from 'prop-types';
import { CellFormatter } from '../../../components';
import { CELL_TYPE } from 'dtable-sdk';
import { INDEX_COLUMN_TYPE, FILE_COLUMN_TYPES } from '../../../constants';

function Record(props) {
  const { columns, record, index, collaborators } = props;

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
        if (type === CELL_TYPE.FORMULA || type === CELL_TYPE.LINK_FORMULA) {
          className += 'sql-query-result-table-formula-cell ';
          const { array_type } = data || {};
          if (array_type === CELL_TYPE.IMAGE || array_type === CELL_TYPE.FILE) {
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
              collaborators={collaborators}
              cellValue={value}
              column={column}
              cellValueUtils={props.cellValueUtils}
              getOptionColors={props.getOptionColors}
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
  collaborators: PropTypes.array,
  cellValueUtils: PropTypes.object,
  openEnlargeFormatter: PropTypes.func,
  onOpenRecordExpandDialog: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getOptionColors: PropTypes.func,
};

export default Record;
