import React from 'react';
import PropTypes from 'prop-types';

function Layout(props) {

  return (
    <div className="dtable-plugin sql-query-plugin">
      <div className="plugin-header sql-query-plugin-header">
        {props.children[0]}
      </div>
      <div className="plugin-main sql-query-plugin-main">
        {props.children[1]}
      </div>
    </div>
  );

}

Layout.propTypes = {
  children: PropTypes.array,
};;

export default Layout;
