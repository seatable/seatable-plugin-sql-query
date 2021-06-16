import { CELL_TYPE } from 'dtable-sdk';

export const isValidEmail = (email) => {
  const reg = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,6}$/;

  return reg.test(email);
};

export const getValueFromPluginConfig = (attribute) => {
  if (window.dtable) {
    return window.dtable[attribute];
  }
  return window.dtablePluginConfig[attribute];
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
    case CELL_TYPE.DATE: {
      let isShowHourAndMinute = data && data.format && data.format.indexOf('HH:mm') > -1;
      return isShowHourAndMinute ? 160 : 100;
    }
    case CELL_TYPE.LONG_TEXT:
    case CELL_TYPE.AUTO_NUMBER:
    case CELL_TYPE.URL:
    case CELL_TYPE.EMAIL: {
      return 200;
    }
    case CELL_TYPE.CHECKBOX: {
      return 80;
    }
    case CELL_TYPE.NUMBER: {
      return 120;
    }
    case CELL_TYPE.CTIME:
    case CELL_TYPE.MTIME: {
      return 170;
    }
    default: {
      return 160;
    }
  }
};
