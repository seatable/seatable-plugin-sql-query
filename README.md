# SeaTable Plugin Development

The SeaTable plugin allows you to provide additional functionality to a table according to your needs. The SeaTable plugin is written in JavaScript language. After compiling and packaging, it can be installed into a table.

This repository provides templates and packaging scripts for plugins.

## Plugin Development Library

Plug-in development can use the following two libraries

1. dtable-sdk, which provides an API for reading and writing the current dtable data (https://docs.seatable.io/published/dtable-sdk/home.md)
2. (Optional) dtable-ui-component, which provides a reusable UI component library (to be improved)

> A table in the SeaTable system is called dtable (database table)

## Plugin Directory Structure

```
build ----------------------------------- folder after project compilation
config ---------------------------------- project compilation configuration folder
plugin-config --------------------------- project zip package configuration folder
plugin-zip ------------------------------ project zip folder after zip packaging
public ---------------------------------- project local development static files folder
scripts --------------------------------- project packaging scripts
src ------------------------------------- project source folder
  locale -------------------------------- project internationalization support folder
    lang -------------------------------- language folder
    index.js ---------------------------- internationalization language support entry file
  app.js -------------------------------- project main code
  entry.js ------------------------------ The entry file of the plugin in the integrated environment
  index.js ------------------------------ Entry file in the development environment
  setting.js ---------------------------- Read configuration file
  setting.local.dist.js ----------------- Sample configuration file
  setting.local.js ---------------------- Configuration file in development environment
```

## Plugin Package

The plug-in package is a file in zip format. The directory structure after decompression is as follows

```
   your-plugin
     -main.js // compiled js file
     -info.json // plugin info file
     -media // plugin static files folder
     -media / main.css // compiled css file
     -media / icon.png // icon image of the plugin
     -media / card_image.png // background image for plugin icon
```

info.json description
   
```
{
  "name": '', // English name of plugin, can only contain letters, numbers, underscores, and underscores
  "version": '', // plugin version number, need to be in a format like 1.0.3
  "display_type": 'dialog / overlay', // plugin display mode, popup a dialog or a overlay
  "display_name": '', // the name the plugin displays on the interface
  "description": '', // description of plugin function
  "has_css": true / false, // whether the plugin contains css files
  "has_icon": true / false, // whether the plugin contains icon images
  "has_card_image": true / false // whether the plugin contains a background image
}
```

## Plugin working mode

Plugins can be run in two ways, one is a development environment, and the other is a production environment.

In the development environment, when the program is initialized, the table on the server is loaded through the information in the configuration file, and then a dialog box is actively displayed.

In the production environment, the table data is already in the browser, so it does not need to be loaded. When the program is initialized (entry.js), it register a callback function with SeaTable. This callback function will be executed when the user clicks the button corresponding to the plugin. In this template, the behavior of the callback function is to let the plug-in pop up a dialog box and display it in the template through the dtable SDK interface

## Basic process of plugin development

### 1. clone project

* clone current project to local
   
### 2. Modify the plugin information file

* Add a custom icon.png as the icon of the plugin in the plugin-config folder (if it is not provided, the default icon will be used. icon.png requires 128x128 pixels)
* Add custom card_image.png as the background image of the plugin icon in the plugin-config folder (if it is not provided, the default background is displayed. card_image.png is required to be 560x240 pixels, the actual display is 280x120 pixels.
* Modify info.json configuration file in plugin-config folder

```
  "name": '', // English name of plugin, can only contain letters, numbers, underscores, and underscores
  "version": '', // plugin version number
  "display_name": '', // name of the plugin display
  "description": '', // description of plugin function
```

There is no need to add other configuration parameters here, other parameters are automatically generated by the packaging tool

### 3. Modify plugin registration function in entry.js file

```
  Update window.app.registerPluginItemCallback ('test', TaskList.execute);
  ⬇️
  To： window.app.registerPluginItemCallback (name, TaskList.execute); where the value of name is the value of "name" in plugin-config/info.json
```

> Note, the "name" must be the save as in the info.json. Otherwise your plugin can't work.

### 4. New and modify plugin development configuration file setting.local.js

The configuration file is used for local development to get dtable data.

```
Configuration parameter description:
const config = {
  APIToken: "**", // dtable api token to be added
  server: "**", // The server URL of the dtable to which the plugin needs to be added
  workspaceID: "**", // The id value of the workspace where the dtable of the plugin needs to be added
  fileName: "**", // The name of the dtable to add the plugin to
  lang: "**" // default language type, en or zh-cn
  mediaUrl: "**", // The mediaUrl value of the dtable where the plug-in needs to be added
};
```

### 5. Add internationalization support

#### There are two cases of plugin internationalization

1. Plugin display name internationalization
2. Internationalization of the internal content of the plugin: The translation strings should be placed in js files and packaged with the plugin's other js source files into a final js file.


#### Plugin display name internationalization

The name displayed by the plug-in can also provide an international display. If you need to provide internationalization for the display name of the plug-in, you can modify the display_name parameter in the plug-in configuration information file `info.json`, the modification type is as follows:

```
display_name: {
  'en': '',
  'fr': '',
  'de': '',
  'zh-cn': '',
  ...
}
```

If you do not need to provide internationalization for the display name of the plug-in, you can directly assign the display_name parameter in the plug-in configuration information file `info.json`

```
display_name: ''
```


#### Internationalization of the internal content of the plugin

We recommend to use [react-intl-universal](https://github.com/alibaba/react-intl-universal) for plugin internationalization.

This library support internationalization for the following contents:
1. Number
2. Currency
3. Date
4. Times
5. Message（Default Message、Message With Variables、HTML Message)

Steps:
1. Add supported language files in `src/locale/lang` **. Js
2. Add the corresponding international key and value key-value pairs in the file
3. In `src/locale/index.js` file
    * Import the defined language file
    * Define the language type supported by default
    * Add language to locales object
4. Import translation components in components that need to add internationalized content `import intl from 'react-intl-universal`
5. Call the intl interface function to complete the corresponding international call work, please use the documentation to move ➡️[react-intl-universal](https://github.com/alibaba/react-intl-universal)

### 6. Start development

* Run `npm install` to install plugin dependencies
* Run `npm run start` to run the local development environment
* At this time, the values ​​of all subtables of the dtable and the details of collaborators in the table are displayed on the interface (the local development version uses the configuration in settings to obtain dtable data. The integrated version directly obtains the current browser DTable data).
  1. The dtable value (tables) can be obtained through the getTables interface function provided by dtable.
  2. The collaborators can be obtained through the getRelatedUsers interface function provided by dtable.
   
* According to requirements, use the interface functions provided by dtable-sdk to update app.js to complete the plug-in function development

app.js code explained

```
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';

import './css/plugin-layout.css';

const propTypes = {
  showDialog: PropTypes.bool
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showDialog: props.showDialog || false,
    };
    this.dtable = new DTable();
  }

  // Description: Initialize the dtable-sdk plugin's interface object 
  componentDidMount() {
    this.initPluginDTableData();  
  }

  // Description: After integrating the plugin, control the display of the content of the plugin
  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});  
  } 

  // Explanation: template function, no need to change
  async initPluginDTableData() {
    if (window.app === undefined) {
      // local develop
      window.app = {};
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else { 
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
    }
    this.dtable.subscribe('remote-data-changed', () => { this.onDTableChanged(); });
    this.resetData();
  }

  // Explanation: template function, no need to change
  onDTableConnect = () => {
    this.resetData();
  }

  // Explanation: template function, no need to change
  onDTableChanged = () => {
    this.resetData();
  }

  // Explanation: Update display data according to requirements
  resetData = () => {}

  // Explanation: template function, no need to change
  onPluginToggle = () => {
    this.setState({showDialog: false});
  }

  // Explanation: Update display content according to business needs
  render() {
    let { isLoading, showDialog } = this.state;
    if (isLoading) {
      return '';
    }

    let subtables = this.dtable.getTables();
    let collaborators = this.dtable.getRelatedUsers();
    
    return (
      <Modal isOpen={showDialog} toggle={this.onPluginToggle} className="dtable-plugin plugin-container" size="lg">
        <ModalHeader className="test-plugin-header" toggle={this.onPluginToggle}>{'插件'}</ModalHeader>
        <ModalBody className="test-plugin-content">
          <div>{`'dtable-subtables: '${JSON.stringify(subtables)}`}</div>
          <br></br>
          <div>{`'dtable-collaborators: '${JSON.stringify(collaborators)}`}</div>
        </ModalBody>
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;

```

## Build zip package and upload plugin

1. Run `npm run build-plugin` to package the plugin
2. Upload the plugin to dtable
