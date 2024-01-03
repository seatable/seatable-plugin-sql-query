import { CellType } from 'dtable-utils';
import { SQL_STATISTIC_KEY_WORDS } from '../constants';

export const getColumnWidth = (column) => {
  let { type, data } = column;
  switch (type) {
    case CellType.DATE: {
      let isShowHourAndMinute = data && data.format && data.format.indexOf('HH:mm') > -1;
      return isShowHourAndMinute ? 160 : 100;
    }
    case CellType.CTIME:
    case CellType.MTIME:
    case CellType.LINK:
    case CellType.GEOLOCATION: {
      return 160;
    }
    case CellType.COLLABORATOR: {
      return 100;
    }
    case CellType.CHECKBOX: {
      return 40;
    }
    case CellType.NUMBER:
    case CellType.AUTO_NUMBER: {
      return 120;
    }
    case CellType.RATE: {
      const { rate_max_number } = data || {};
      const rateMaxNumber = rate_max_number || 5;
      return 16 * rateMaxNumber + 20;
    }
    default: {
      return 100;
    }
  }
};

export const debounce = (fn, wait = 100) => {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
};

export const initScrollBar = () => {
  const isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows');
  if (isWin) {
    const style = document.createElement('style');
    document.head.appendChild(style);
    const sheet = style.sheet;
    sheet.addRule('div::-webkit-scrollbar','width: 8px;height: 8px;');
    sheet.addRule('div::-webkit-scrollbar-button','display: none;');
    sheet.addRule('div::-webkit-scrollbar-thumb','background-color: rgb(206, 206, 212);border-radius: 10px;');
  }
};

export const isUnionQuery = (sql) => {
  if (!sql) return false;
  const tables = window.dtableSDK.getTables();
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const reg = new RegExp(`(\`)*${table.name}(\`)*\\.`);
    if (reg.test(sql)) return true;
  }
  return false;
};

export const getValidSQL = (sql) => {
  const upperSQL = sql.toUpperCase();
  if (!upperSQL.trim().startsWith('SELECT ')) return sql;
  if (upperSQL.indexOf('GROUP BY') > -1) return sql;
  const selectIndex = upperSQL.indexOf('SELECT ');
  const fromIndex = upperSQL.indexOf(' FROM ');
  const selectedString = upperSQL.slice(selectIndex + 7, fromIndex);
  if (selectedString.indexOf('*') > -1) return sql;
  if (selectedString.indexOf('_ID') > -1) return sql;
  if (SQL_STATISTIC_KEY_WORDS.filter(item => selectedString.indexOf(item) > -1).length > 0) return sql;
  if (isUnionQuery(sql)) return sql;
  return sql.slice(0, selectIndex + 7) + `\`_id\`, ${sql.slice(selectIndex + 7)}`;
};

export const getErrorMsg = (error, t) => {
  let errorMsg = '';
  if (error.response) {
    if (error.response.status === 403) {
      errorMsg = t('Permission_denied');
    } else if (error.response.data && error.response.data['error_msg']) {
      errorMsg = error.response.data['error_msg'];
    } else if (error.response.data && error.response.data['error_message']) {
      errorMsg = error.response.data['error_message'];
    } else {
      errorMsg = t('Error');
    }
  } else {
    errorMsg = t('Please_check_the_network');
  }
  return errorMsg;
};
