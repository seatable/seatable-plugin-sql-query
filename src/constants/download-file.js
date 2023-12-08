import { CellType } from 'dtable-utils';

export const DOWNLOAD_NAME_COLUMN_TYPES = [
  CellType.TEXT,
  CellType.NUMBER,
  CellType.DATE,
  CellType.COLLABORATOR,
  CellType.CREATOR,
  CellType.AUTO_NUMBER
];

export const FILES_SLICE_LENGTH = 50;
export const START = 'start';
export const END = 'end';

export const FILE_COLUMN_TYPES = [
  CellType.FILE,
];
