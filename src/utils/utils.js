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
