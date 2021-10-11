import { CELL_TYPE, FORMULA_RESULT_TYPE } from 'dtable-sdk';
import { getFormulaArrayValue, getLongTextCellValueInDtable } from './common-utils';

class CellValueUtils {

  constructor({ dtable }) {
    this.dtable = dtable;
  }

  getCollaboratorsName = (collaborators, cellVal) => {
    if (cellVal) {
      let collaboratorsName = [];
      cellVal.forEach((v) => {
        let collaborator = collaborators.find(c => c.email === v);
        if (collaborator) {
          collaboratorsName.push(collaborator.name);
        }
      });
      if (collaboratorsName.length === 0) {
        return null;
      }
      return collaboratorsName.join(', ');
    }
    return null;
  }

  getLongTextDisplayString = (cellValue) => {
    let { text } = cellValue || {};
    if (!text) return '';
    return text;
  }

  getCellValueDisplayString = (cellValue, column, {tables = [], collaborators = []} = {}) => {
    const { type, data } = column;
    const newData = data || {};
    switch (type) {
      case CELL_TYPE.GEOLOCATION: {
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          return cellValue.map(item => this.dtable.getGeolocationDisplayString(item, data)).join(', ');
        }
        return this.dtable.getGeolocationDisplayString(cellValue, data);
      }
      case CELL_TYPE.SINGLE_SELECT: {
        if (!newData) return '';
        const { options } = newData;
        if (!cellValue || !options || !Array.isArray(options)) return '';
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          const selectedOptions = options.filter((option) => cellValue.includes(option.id));
          if (selectedOptions.length === 0) return '';
          return selectedOptions.map((option) => option.name).join(', ');
        }
        const option = options.find(option => option.id === cellValue);
        return option ? option.name : '';
      }
      case CELL_TYPE.MULTIPLE_SELECT: {
        if (!newData) return '';
        let { options } = newData;
        if (!cellValue || !options || !Array.isArray(options)) return '';
        let selectedOptions = options.filter((option) => cellValue.includes(option.id));
        if (selectedOptions.length === 0) return '';
        return selectedOptions.map((option) => option.name).join(', ');
      }
      case CELL_TYPE.FORMULA:
      case CELL_TYPE.LINK_FORMULA: {
        const { linked_column_type, linked_column_data, data } = column;
        const { result_type: currentResultType } = data;
        let value = cellValue;
        if (Array.isArray(cellValue)) {
          if (linked_column_type === CELL_TYPE.DATE || currentResultType === FORMULA_RESULT_TYPE.DATE) {
            value = cellValue.map(item => item.replace('T', ' ').replace('Z', ''));
          } else if ((linked_column_type === CELL_TYPE.FORMULA || linked_column_type === CELL_TYPE.LINK_FORMULA)
            && linked_column_data.result_type === FORMULA_RESULT_TYPE.DATE) {
            value = cellValue.map(item => item.replace('T', ' ').replace('Z', ''));
          } else if (linked_column_type === CELL_TYPE.LONG_TEXT) {
            value = cellValue.map(item => getLongTextCellValueInDtable(item));
          }
        } else {
          if (currentResultType === FORMULA_RESULT_TYPE.DATE) {
            value = cellValue.replace('T', ' ').replace('Z', '');
          }
        }
        return this.dtable.getFormulaDisplayString(value, newData, { tables, collaborators });
      }
      case CELL_TYPE.LONG_TEXT: {
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          return cellValue.map(item => this.getLongTextDisplayString(item)).join(', ');
        }
        return this.getLongTextDisplayString(cellValue);
      }
      case CELL_TYPE.NUMBER: {
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          return cellValue.map(item => this.getNumberDisplayString(item, newData)).join(', ');
        }
        return this.dtable.getNumberDisplayString(cellValue, newData);
      }
      case CELL_TYPE.DATE: {
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          const validCellValue = cellValue.filter(item => item && typeof item === 'string');
          return validCellValue.map(item => this.dtable.getDateDisplayString(item.replace('T', ' ').replace('Z', ''), newData));
        }
        if (!cellValue || typeof item !== 'string') return '';
        return this.dtable.getDateDisplayString(cellValue.replace('T', ' ').replace('Z', ''), newData);
      }
      case CELL_TYPE.CREATOR:
      case CELL_TYPE.LAST_MODIFIER: {
        if (!cellValue) return '';
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          return this.getCollaboratorsName(collaborators, cellValue);
        }
        return cellValue === 'anonymous' ? cellValue : this.getCollaboratorsName(collaborators, [cellValue]);
      }
      case CELL_TYPE.COLLABORATOR: {
        return this.getCollaboratorsName(collaborators, cellValue);
      }
      case CELL_TYPE.DURATION: {
        if (!cellValue && cellValue !== 0) return '';
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          return cellValue.map(item => this.dtable.getDurationDisplayString(item, newData)).join(', ');
        }
        return this.dtable.getDurationDisplayString(cellValue, newData);
      }
      case CELL_TYPE.LINK: {
        if (!Array.isArray(cellValue) || cellValue.length === 0) return '';
        const { linked_column_data, data, linked_column_type } = column;
        const { display_column_key } = data;
        const display_column = {
          key: display_column_key || '0000',
          type: linked_column_type || 'text',
          data: linked_column_data || null
        };
        return this.getCellValueDisplayString(cellValue, display_column, { tables, collaborators });
      }
      case CELL_TYPE.RATE: {
        if (Array.isArray(cellValue)) {
          if (cellValue.length === 0) return '';
          return cellValue.map(item => item || item === 0).join(', ');
        }
        return cellValue;
      }
      default: {
        return cellValue ? cellValue + '' : '';
      }
    }
  }

  getExportRows = (columns, rows, { tables = [], collaborators = [] } = {}) => {
    let columnsKeyNameMap = {};
    Array.isArray(columns) && columns.forEach(column => {
      const { key, name } = column;
      if (key && name) {
        columnsKeyNameMap[key] = column;
      }
    });
    return Array.isArray(rows) ? rows.map(row => {
      let newRow = {};
      Object.keys(columnsKeyNameMap).forEach(key => {
        const column = columnsKeyNameMap[key];
        const { name, type } = column;
        const cellValue = row[key];
        if (type === CELL_TYPE.LONG_TEXT) {
          newRow[name] = getLongTextCellValueInDtable(cellValue);
        } else if (type === CELL_TYPE.LINK) {
          const validCellValue = getFormulaArrayValue(cellValue);
          newRow[name] = this.getCellValueDisplayString(validCellValue, column, { tables, collaborators });
        }  else if (type === CELL_TYPE.FORMULA || type === CELL_TYPE.LINK_FORMULA) {
          const validCellValue = Array.isArray(cellValue) ? getFormulaArrayValue(cellValue) : cellValue;
          newRow[name] = this.getCellValueDisplayString(validCellValue, column, { tables, collaborators });
        } else if (type === CELL_TYPE.BUTTON) {
          //
        } else {
          newRow[name] = row[key];
        }
      });
      return newRow;
    }) : [];
  }

  getExportColumns = (columns) => {
    if (!Array.isArray(columns)) return [];
    return columns.map(column => {
      if (column.type === CELL_TYPE.LINK_FORMULA
        || column.type === CELL_TYPE.FORMULA
        || column.type === CELL_TYPE.LINK) {
        return { ...column, data: null, type: CELL_TYPE.TEXT };
      }
      return column;
    });
  }

}

export default CellValueUtils;
