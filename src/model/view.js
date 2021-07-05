import intl from 'react-intl-universal';

class View {

  constructor(object) {
    this._id = object._id || '0000';
    this.name = object.name || intl.get('Default_view');
    this.sql = object.sql || '';
  }

}

export default View;
