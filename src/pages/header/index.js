import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import LOGO from '../../assets/images/sql-query.png';

function Header(props) {
  return (
    <div>
      <div className="sql-query-plugin-header">
        <div className="sql-query-plugin-header-left">
          <img src={LOGO} alt="logo" width="24"/>
          <span className="ml-2">{intl.get('SQL_query')}</span>
        </div>
        <div className="sql-query-plugin-header-right" onClick={props.onCloseToggle}>
          <i title={intl.get('Close')} className="dtable-font dtable-icon-fork-number"></i>
        </div>
      </div>
    </div>
  );
}

Header.propTypes = {
  onCloseToggle: PropTypes.func,
};

export default Header;
