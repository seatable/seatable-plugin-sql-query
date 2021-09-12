import React from 'react';
import PropTypes from 'prop-types';
import FileEnlargeFormatter from './enlarge-formatter-widgets/file-enlarge-formatter';
import { CELL_TYPE } from 'dtable-sdk';

const enlargeFormatterMap = {
  [CELL_TYPE.FILE]: FileEnlargeFormatter,
};

function EnlargeFormatter(props) {
  const { column, value } = props;
  const EnlargeFormatterItem = enlargeFormatterMap[column.type];
  if (!EnlargeFormatterItem) {
    return null;
  }

  return (<EnlargeFormatterItem value={value} closeEnlargeFormatter={props.closeEnlargeFormatter} />);
}

EnlargeFormatter.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.any,
  closeEnlargeFormatter: PropTypes.func,
};

export default EnlargeFormatter;
