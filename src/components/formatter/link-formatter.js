import React from 'react';
import PropTypes from 'prop-types';
import SingleColumnArrayValue from './single-column-array-value';

function LinkFormatter(props) {
  const { column, value, containerClassName, collaborators } = props;
  const { data } = column;
  if (!Array.isArray(value) || value.length === 0) return props.renderEmptyFormatter();
  let { display_column } = data || {};
  if (!display_column) return props.renderEmptyFormatter();
  return <SingleColumnArrayValue
    column={display_column}
    value={value}
    collaborators={collaborators}
    containerClassName={containerClassName}
    renderEmptyFormatter={props.renderEmptyFormatter}
    getOptionColors={props.getOptionColors}
    getUserCommonInfo={props.getUserCommonInfo}
    getDurationDisplayString={props.getDurationDisplayString}
    getGeolocationDisplayString={props.getGeolocationDisplayString}
  />;
}

LinkFormatter.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.any,
  collaborators: PropTypes.array,
  containerClassName: PropTypes.string,
  renderEmptyFormatter: PropTypes.func,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getDurationDisplayString: PropTypes.func,
  getGeolocationDisplayString: PropTypes.func,
};

export default LinkFormatter;
