import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';

function FooterRecord(props) {
  const { recordsCount, width } = props;
  return (
    <div className="sql-query-result-table-row sql-query-result-table-count-row" style={{ width }}>
      <div className="sql-query-result-count">
        {recordsCount > 1 ? intl.get('xxx_records', { count: recordsCount }) : intl.get('1_record')}
      </div>
    </div>
  );
}

FooterRecord.propTypes = {
  recordsCount: PropTypes.number,
  width: PropTypes.number,
};

export default FooterRecord;
