class SqlOptionsLocalStorage {

  constructor({appKey ,dtableUuid}) {
    this.appKey = appKey;
    this.dtableUuid = dtableUuid;
  }

  getAllHistorySqlOptions = () => {
    try {
      return JSON.parse(window.localStorage.getItem(this.appKey)) || {};
    } catch {
      return {};
    }
  }

  getCurrentHistorySqlOptions = () => {
    let allHistorySqlOptions = this.getAllHistorySqlOptions();
    return allHistorySqlOptions[this.dtableUuid] || [];
  }

  saveHistorySqlOptions = (options) => {
    if (!Array.isArray(options) || options.length < 1) return;
    let allHistorySqlOptions = this.getAllHistorySqlOptions();
    let newAllHistorySqlOptions = { ...allHistorySqlOptions, [this.dtableUuid]: options };
    window.localStorage.setItem(this.appKey, JSON.stringify(newAllHistorySqlOptions));
  }

}

export default SqlOptionsLocalStorage;
