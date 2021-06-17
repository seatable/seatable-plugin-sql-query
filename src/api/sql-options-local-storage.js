class SqlOptionsLocalStorage {

  constructor(dtableUuid) {
    this.appKey = `sql-query&${dtableUuid}`;
  }

  getCurrentHistorySqlOptions = () => {
    try {
      return JSON.parse(window.localStorage.getItem(this.appKey)) || [];
    } catch {
      return [];
    }
  }

  saveHistorySqlOptions = (options) => {
    if (!Array.isArray(options) || options.length < 1) return;
    window.localStorage.setItem(this.appKey, JSON.stringify(options.slice(0, 10)));
  }

}

export default SqlOptionsLocalStorage;
