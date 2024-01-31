import axios from 'axios';

class DTableDbAPI {

  constructor() {
    this.req = null;
  }

  init() {
    const { accessToken, dtableDb } = window.dtable;
    if (this.req) {
      this.req.defaults.headers['Authorization'] = 'Token ' + accessToken;
      return;
    } 
    this.req = axios.create({
      baseURL: dtableDb,
      headers: { 'Authorization': 'Token ' + accessToken }
    });
  }

  listRowLinkedRecords = (dtableUuid, tableId, columnKey, rowId, offset) => {
    this.init();
    offset = offset ? offset : 0;
    const url = 'api/v1/linked-records/' + dtableUuid;
    const data = {
      table_id: tableId,
      link_column: columnKey,
      rows: [{ row_id: rowId, offset, limit: 10 }]
    };
    return this.req.post(url, data);
  };

  listTableRowsByIds = (dtableUuid, tableName, rowIds) => {
    this.init();
    const url = 'api/v1/query/' + dtableUuid;
    const newRowIds = rowIds.map(item => `'${item}'`);
    const sql = `select * from \`${tableName}\` where _id in (${newRowIds.join(', ')})`;
    const data = { sql: sql };
    return this.req.post(url, data);
  };

  sqlQuery(dtableUuid, sql, parameters, convert_keys = false) {
    this.init();
    const url = 'api/v1/query/' + dtableUuid;
    let data = { sql: sql, convert_keys };
    if (parameters) {
      data['parameters'] = parameters;
    }
    return this.req.post(url, data);
  }

}

const dtableDbAPI = new DTableDbAPI();

export default dtableDbAPI;
