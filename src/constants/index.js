import { CELL_TYPE } from 'dtable-sdk';
import { View } from '../model';
export { FILE_COLUMN_TYPES, START, FILES_SLICE_LENGTH, END, DOWNLOAD_NAME_COLUMN_TYPES } from './download-file';
export { INDEX_COLUMN_TYPE, INDEX_COLUMN } from './index-column';

export const PLUGIN_NAME = 'sql-query';

export const QUERY_STATUS = {
  READY: 'ready',
  DOING: 'doing',
  DONE: 'done'
};

export const PER_DISPLAY_COUNT = 25;

export const NOT_SUPPORT_COLUMN_TYPES = [
];

export const NOT_DISPLAY_COLUMN_KEYS = [
  '_locked',
  '_locked_by',
];

export const PARTICIPANTS_TYPE = 'participants';

export const PRIVATE_COLUMN_KEY_TYPE_MAP = {
  '_creator': CELL_TYPE.CREATOR,
  '_last_modifier': CELL_TYPE.LAST_MODIFIER,
  '_ctime': CELL_TYPE.CTIME,
  '_mtime': CELL_TYPE.MTIME,
  '_locked': CELL_TYPE.CHECKBOX,
  '_locked_by': CELL_TYPE.CREATOR,
  '_id': CELL_TYPE.TEXT,
  '_participants': PARTICIPANTS_TYPE, // Currently, the content of the _participants attribute is not returned
};

export const FORMULA_COLUMN_TYPES = [
  CELL_TYPE.FORMULA,
  CELL_TYPE.LINK_FORMULA
];

export const COLUMNS_ICONS = {
  [CELL_TYPE.DEFAULT]: 'dtable-font dtable-icon-single-line-text',
  [CELL_TYPE.TEXT]: 'dtable-font dtable-icon-single-line-text',
  [CELL_TYPE.NUMBER]: 'dtable-font dtable-icon-number',
  [CELL_TYPE.CHECKBOX]: 'dtable-font dtable-icon-check-square-solid',
  [CELL_TYPE.DATE]: 'dtable-font dtable-icon-calendar-alt-solid',
  [CELL_TYPE.SINGLE_SELECT]: 'dtable-font dtable-icon-single-election',
  [CELL_TYPE.LONG_TEXT]: 'dtable-font dtable-icon-long-text',
  [CELL_TYPE.IMAGE]: 'dtable-font dtable-icon-picture',
  [CELL_TYPE.FILE]: 'dtable-font dtable-icon-file-alt-solid',
  [CELL_TYPE.MULTIPLE_SELECT]: 'dtable-font dtable-icon-multiple-selection',
  [CELL_TYPE.COLLABORATOR]: 'dtable-font dtable-icon-collaborator',
  [CELL_TYPE.LINK]: 'dtable-font dtable-icon-link-other-record',
  [CELL_TYPE.FORMULA]: 'dtable-font dtable-icon-formula',
  [CELL_TYPE.LINK_FORMULA]: 'dtable-font dtable-icon-link-formulas',
  [CELL_TYPE.CREATOR]: 'dtable-font dtable-icon-creator',
  [CELL_TYPE.CTIME]: 'dtable-font dtable-icon-creation-time',
  [CELL_TYPE.LAST_MODIFIER]: 'dtable-font dtable-icon-creator',
  [CELL_TYPE.MTIME]: 'dtable-font dtable-icon-creation-time',
  [CELL_TYPE.GEOLOCATION]: 'dtable-font dtable-icon-location',
  [CELL_TYPE.AUTO_NUMBER]: 'dtable-font dtable-icon-autonumber',
  [CELL_TYPE.URL]: 'dtable-font dtable-icon-url',
  [CELL_TYPE.EMAIL]: 'dtable-font dtable-icon-email',
  [CELL_TYPE.DURATION]: 'dtable-font dtable-icon-duration',
  [CELL_TYPE.BUTTON]: 'dtable-font dtable-icon-button',
  [CELL_TYPE.RATE]: 'dtable-font dtable-icon-star',
};

export const DEFAULT_SETTINGS = [
  new View({ _id: '0000' }),
];
