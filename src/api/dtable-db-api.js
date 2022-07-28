import axios from 'axios';
import pluginContext from '../plugin-context';

class DTableDbAPI {

  constructor() {
    this.req = null;
  }

  init() {
    if (this.req) return;
    const accessToken = pluginContext.getSetting('accessToken');
    const dtableDb = pluginContext.getSetting('dtableDb');
    this.req = axios.create({
      baseURL: dtableDb,
      headers: { 'Authorization': 'Token ' + accessToken }
    });
  }

  listRowLinkedRecords = (dtableUuid, tableId, columnKey, rowId, offset) => {
    this.init();
    offset = offset ? offset : 0;
    const url = 'api/v1/linked-records/'+ dtableUuid;
    const data = {
      table_id: tableId,
      link_column: columnKey,
      rows: [{ row_id: rowId, offset, limit: 10 }]
    };
    return this.req.post(url, data);
  }

  listTableRowsByIds = (dtableUuid, tableName, rowIds) => {
    this.init();
    const url = 'api/v1/query/'+ dtableUuid;
    const newRowIds = rowIds.map(item => `'${item}'`);
    const sql = `select * from \`${tableName}\` where _id in (${newRowIds.join(', ')})`;
    const data = { sql: sql };
    return this.req.post(url, data);
  }

}

const dtableDbAPI = new DTableDbAPI();

export default dtableDbAPI;
