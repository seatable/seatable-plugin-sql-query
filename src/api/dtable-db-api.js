import axios from 'axios';

class DTableDbAPI {

  constructor() {
    this.req = null;
  }

  init() {
    if (this.req) return;
    const { accessToken, dtableDb } = window.dtable;
    this.req = axios.create({
      baseURL: dtableDb,
      headers: { 'Authorization': 'Token ' + accessToken }
    });
  }

  listRowLinkedRecords(dtableUuid, tableId, linkColumnKey, rowId, offset) {
    this.init();
    const url = `api/v2/dtables/${dtableUuid}/query-links/`;
    const data = {
      table_id: tableId,
      link_column_key: linkColumnKey,
      rows: [{ row_id: rowId, offset, limit: 10 }]
    };
    return this.req.post(url, data);
  }

  listTableRowsByIds = (dtableUuid, tableName, rowIds) => {
    this.init();
    const newRowIds = rowIds.map(item => `'${item}'`);
    const sql = `select * from \`${tableName}\` where _id in (${newRowIds.join(', ')})`;
    return this.sqlQuery(dtableUuid, sql);
  };

  sqlQuery(dtableUuid, sql, parameters = [], convert_keys = false) {
    this.init();
    const url = `api/v2/dtables/${dtableUuid}/sql/`;
    const data = {
      sql,
      parameters,
      convert_keys,
    };
    return this.req.post(url, data);
  }

}

const dtableDbAPI = new DTableDbAPI();

export default dtableDbAPI;
