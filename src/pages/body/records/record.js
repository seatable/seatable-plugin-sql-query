import React from 'react';
import PropTypes from 'prop-types';
import { CellFormatter } from '../../../components';
import { CELL_TYPE } from 'dtable-sdk';
import { INDEX_COLUMN_TYPE, FILE_COLUMN_TYPES } from '../../../constants';

function Record(props) {
  const { fields, record, index, collaborators } = props;
  let totalWidth = 0;

  return (
    <div className="sql-query-result-table-row record-height-default">
      {fields.map((field) => {
        const { key, name, width, type, data } = field;
        let style = {};
        let className = 'sql-query-result-table-cell ';
        if (field.isFrozen) {
          style['position'] = 'sticky';
          style['left'] = totalWidth;
          totalWidth += field.width;
          className = className + 'sql-query-result-table-fix-left-cell ';
        }
        if (field.isFrozen && field.isLastFrozen) {
          className = className + 'sql-query-result-table-last-fix-left-cell ';
        }
        if (type === INDEX_COLUMN_TYPE) {
          return (
            <div className={`${className} index`} key={`${key}-${{index}}`} style={{ ...style, width, maxWidth: width, minWidth: width }}>
              <div className="sql-query-row-index-container" style={{width, maxWidth: width, minWidth: width}}>
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
            style={{ ...style, width, maxWidth: width, minWidth: width }}
            onDoubleClick={FILE_COLUMN_TYPES.includes(type) ? () => props.openEnlargeFormatter(field, value) : () => {}}
          >
            <CellFormatter
              collaborators={collaborators}
              cellValue={value}
              column={field}
              getOptionColors={props.getOptionColors}
              getUserCommonInfo={props.getUserCommonInfo}
              getCellValueDisplayString={props.getCellValueDisplayString}
            />
          </div>
        );
      })}
    </div>
  );
}

Record.propTypes = {
  fields: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  collaborators: PropTypes.array,
  openEnlargeFormatter: PropTypes.func,
  onOpenRecordExpandDialog: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getOptionColors: PropTypes.func,
  getCellValueDisplayString: PropTypes.func,
};

export default Record;
