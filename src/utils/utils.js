import { CELL_TYPE } from 'dtable-sdk';

export const getColumnWidth = (column) => {
  let { type, data } = column;
  switch (type) {
    case CELL_TYPE.DATE: {
      let isShowHourAndMinute = data && data.format && data.format.indexOf('HH:mm') > -1;
      return isShowHourAndMinute ? 160 : 100;
    }
    case CELL_TYPE.CTIME:
    case CELL_TYPE.MTIME:
    case CELL_TYPE.LINK:
    case CELL_TYPE.GEOLOCATION: {
      return 160;
    }
    case CELL_TYPE.COLLABORATOR: {
      return 100;
    }
    case CELL_TYPE.CHECKBOX: {
      return 40;
    }
    case CELL_TYPE.NUMBER:
    case CELL_TYPE.AUTO_NUMBER: {
      return 120;
    }
    case CELL_TYPE.RATE: {
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
