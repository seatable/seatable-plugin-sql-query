import intl from 'react-intl-universal';
import { CellType } from 'dtable-utils';
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
  '_creator': CellType.CREATOR,
  '_last_modifier': CellType.LAST_MODIFIER,
  '_ctime': CellType.CTIME,
  '_mtime': CellType.MTIME,
  '_locked': CellType.CHECKBOX,
  '_locked_by': CellType.CREATOR,
  '_id': CellType.TEXT,
  '_participants': PARTICIPANTS_TYPE, // Currently, the content of the _participants attribute is not returned
};

export const UNKNOWN_TYPE = 'unknown';

export const DEFAULT_SETTINGS = [
  new View({ _id: '0000', name: intl.get('Default_view') }),
];

export const SEQUENCE_COLUMN_WIDTH = 80;

export const FIRST_COLUMN_SHADOW = '2px 0 5px -2px hsla(0, 0%, 53.3%, .3)';

export const TABLE_SUPPORT_EDIT_TYPE_MAP = {
  [CellType.TEXT]: true,
  [CellType.DATE]: true,
  [CellType.NUMBER]: true,
  [CellType.SINGLE_SELECT]: true,
  [CellType.MULTIPLE_SELECT]: true,
  [CellType.COLLABORATOR]: true,
  [CellType.LONG_TEXT]: true,
  [CellType.IMAGE]: true,
  [CellType.FILE]: true,
  [CellType.GEOLOCATION]: true,
  [CellType.CHECKBOX]: true,
  [CellType.EMAIL]: true,
  [CellType.URL]: true,
  [CellType.DURATION]: true,
  [CellType.RATE]: true,
  [CellType.LINK]: true,
};

export const CANVAS_RIGHT_INTERVAL = 240;

export const LINK_UNSHOW_COLUMN_TYPE = [
  CellType.BUTTON
];

export const SQL_STATISTIC_KEY_WORDS = [
  'SUM',
  'COUNT',
  'MAX',
  'MIN',
  'AVG',
  'DISTINCT',
];

export const LEFT_NAV = 280;
export const ROW_DETAIL_PADDING = 40 * 2;
export const ROW_DETAIL_MARGIN = 20 * 2;
export const EDITOR_PADDING = 1.5 * 16; // 1.5: 0.75 * 2

