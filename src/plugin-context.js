class PluginContext {

  constructor() {
    this.settings = window.dtable ? window.dtable : window.dtablePluginConfig;
    this.api = window.dtableWebAPI ? window.dtableWebAPI : null;
  }

  getConfig() {
    return this.settings;
  }

  getSetting(key) {
    return this.settings[key] || '';
  }

  getInitData() {
    return window.app && window.app.dtableStore;
  }
}

const pluginContext = new PluginContext();

export default pluginContext;
