import { CellType } from 'dtable-utils';
import getPreviewContent from 'dtable-ui-component/lib/SimpleLongTextFormatter/normalize-long-text-value';
import { NOT_SUPPORT_COLUMN_TYPES, NOT_DISPLAY_COLUMN_KEYS } from '../constants';

export const isValidEmail = (email) => {
  const reg = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,6}$/;

  return reg.test(email);
};

export const getValueFromPluginConfig = (attribute) => {
  return window.dtable[attribute];
};

export const getValueFromPluginAppConfig = (attribute) => {
  if (window.app) {
    return window.app[attribute];
  }
  return window.dtablePluginConfig[attribute];
};

export const getCellRecordWidth = (column) => {
  let { type, data } = column;
  switch (type) {
    case CellType.DATE: {
      let isShowHourAndMinute = data && data.format && data.format.indexOf('HH:mm') > -1;
      return isShowHourAndMinute ? 160 : 100;
    }
    case CellType.LONG_TEXT:
    case CellType.AUTO_NUMBER:
    case CellType.URL:
    case CellType.EMAIL: {
      return 200;
    }
    case CellType.CHECKBOX: {
      return 80;
    }
    case CellType.NUMBER: {
      return 120;
    }
    case CellType.CTIME:
    case CellType.MTIME: {
      return 170;
    }
    case CellType.RATE: {
      const { rate_max_number } = data || {};
      const rateMaxNumber = rate_max_number || 5;
      return 16 * rateMaxNumber + 20;
    }
    case CellType.LINK: {
      return 200;
    }
    default: {
      return 160;
    }
  }
};

export const generatorBase64Code = (keyLength = 4) => {
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < keyLength; i++) {
    key += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return key;
};

export const generatorViewId = (views) => {
  let view_id, isUnique = false;
  while (!isUnique) {
    view_id = generatorBase64Code(4);

    // eslint-disable-next-line
    isUnique = views.every(item => {return item._id !== view_id;});
    if (isUnique) {
      break;
    }
  }
  return view_id;
};

export const bytesToSize = bytes => {
  if (typeof(bytes) == 'undefined') return ' ';

  if(bytes < 0) return '--';
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  if (bytes === 0) return bytes + sizes[0];

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10);
  if (i === 0) return bytes + sizes[i];
  return (bytes / (1000 ** i)).toFixed(1) + sizes[i];
};

export const isArrayFormalColumn = (columnType) => {
  return [
    CellType.IMAGE,
    CellType.FILE,
    CellType.MULTIPLE_SELECT,
    CellType.COLLABORATOR
  ].includes(columnType);
};

export const isValidCellValue = (value) => {
  if (value === undefined) return false;
  if (value === null) return false;
  if (value === '') return false;
  if (JSON.stringify(value) === '{}') return false;
  if (JSON.stringify(value) === '[]') return false;
  return true;
};

export const getFormulaArrayValue = (value, isFlat = true) => {
  if (!Array.isArray(value)) return [];
  if (!isFlat) return getTwoDimensionArrayValue(value);
  return value
    .map(item => {
      if (Object.prototype.toString.call(item) !== '[object Object]') {
        return item;
      }
      if (!Object.prototype.hasOwnProperty.call(item, 'display_value')) return item;
      const { display_value } = item;
      if (!Array.isArray(display_value) || display_value.length === 0) return display_value;
      return display_value.map(i => {
        if (Object.prototype.toString.call(i) === '[object Object]') {
          if (!Object.prototype.hasOwnProperty.call(i, 'display_value')) return i;
          const { display_value } = i;
          return display_value;
        }
        return i;
      });
    })
    .flat()
    .filter(item => isValidCellValue(item));
};

const getTwoDimensionArrayValue = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (Object.prototype.toString.call(item) !== '[object Object]') {
        return item;
      }
      if (!Object.prototype.hasOwnProperty.call(item, 'display_value')) return item;
      const { display_value } = item;
      if (!Array.isArray(display_value) || display_value.length === 0) return display_value;
      return display_value.map(i => {
        if (Object.prototype.toString.call(i) === '[object Object]') {
          if (!Object.prototype.hasOwnProperty.call(i, 'display_value')) return i;
          const { display_value } = i;
          return display_value;
        }
        return i;
      });
    });
};

export const convertValueToDtableLongTextValue = (value) => {
  const valueType = Object.prototype.toString.call(value);
  if (value && valueType === '[object String]') {
    return getPreviewContent(value);
  }
  if (valueType === '[object Object]') {
    return value;
  }
  return '';
};

export const getDisplayColumns = (columns, isActiveQueryId) => {
  if (!Array.isArray(columns) || columns.length === 0) return [];
  const displayColumns = columns.filter(column => {
    const { type, key } = column;
    if (NOT_SUPPORT_COLUMN_TYPES.includes(type)) return false;
    if (NOT_DISPLAY_COLUMN_KEYS.includes(key)) return false;
    return true;
  });
  return isActiveQueryId ? displayColumns : displayColumns.filter(column => column.key !== '_id');
};

export const addClassName = (originClassName, targetClassName) => {
  const originClassNames = originClassName.split(' ');
  if (originClassNames.indexOf(targetClassName) > -1) return originClassName;
  return originClassName + ' ' + targetClassName;
};

export const removeClassName = (originClassName, targetClassName) => {
  let originClassNames = originClassName.split(' ');
  const targetClassNameIndex = originClassNames.indexOf(targetClassName);
  if (targetClassNameIndex < 0) return originClassName;
  originClassNames.splice(targetClassNameIndex, 1);
  return originClassNames.join(' ');
};

export const getTableHiddenColumnKeys = (table, viewId, getViewById) => {
  if (!table) return [];
  const { views } = table;
  if (viewId) {
    const view = getViewById(table, viewId);
    if (view) {
      const { hidden_columns = [] } = view;
      if (!Array.isArray(hidden_columns)) return [];

      // avoid modifying referenced raw data
      return [ ...hidden_columns ];
    }
    // view is not exist
  }

  // take the union of all view hidden columns in the current table
  const isAllViewHasHiddenColumns = views.every(view => {
    return view.hidden_columns && Array.isArray(view.hidden_columns) && view.hidden_columns.length > 0;
  });
  if (!isAllViewHasHiddenColumns) return [];

  let hiddenColumnKeys = [];
  const { hidden_columns } = views[0];
  hidden_columns.forEach(key => {
    const isExist = views.every(view => view.hidden_columns.includes(key));
    if (isExist) hiddenColumnKeys.push(key);
  });
  return hiddenColumnKeys;
};
