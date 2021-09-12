import { CELL_TYPE } from 'dtable-sdk';

export const DOWNLOAD_NAME_COLUMN_TYPES = [
  CELL_TYPE.TEXT,
  CELL_TYPE.NUMBER,
  CELL_TYPE.DATE,
  CELL_TYPE.COLLABORATOR,
  CELL_TYPE.CREATOR,
  CELL_TYPE.AUTO_NUMBER
];

export const FILES_SLICE_LENGTH = 50;
export const START = 'start';
export const END = 'end';

export const FILE_COLUMN_TYPES = [
  CELL_TYPE.FILE,
];
