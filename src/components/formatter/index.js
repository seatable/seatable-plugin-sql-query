import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { 
  TextFormatter,
  NumberFormatter,
  CheckboxFormatter,
  DateFormatter,
  SingleSelectFormatter,
  MultipleSelectFormatter,
  CollaboratorFormatter,
  ImageFormatter,
  FileFormatter,
  LongTextFormatter,
  GeolocationFormatter,
  CTimeFormatter,
  MTimeFormatter,
  AutoNumberFormatter,
  UrlFormatter,
  EmailFormatter,
  DurationFormatter,
  RateFormatter,
  ButtonFormatter,
  FormulaFormatter
} from 'dtable-ui-component';
import { CELL_TYPE, FORMULA_RESULT_TYPE } from 'dtable-sdk';
import CreatorFormatter from './creator-formatter';
import LinkFormatter from './link-formatter';
import { getFormulaArrayValue } from '../../utils/common-utils';

class CellFormatter extends React.Component {

  renderEmptyFormatter = () => {
    return null;
  }

  downloadImage = (url) => {
    let seafileFileIndex = url.indexOf('seafile-connector');
    if (seafileFileIndex > -1) return;
    window.location.href = url + '?dl=1';
  }

  renderFormatter = () => {
    let { column, cellValue, collaborators, tables } = this.props;
    const { type: columnType } = column || {};
    const containerClassName = `sql-query-${columnType}-formatter`;
    
    switch(columnType) {
      case CELL_TYPE.TEXT: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <TextFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.COLLABORATOR: {
        if (!Array.isArray(cellValue) || cellValue.length === 0) return this.renderEmptyFormatter();
        cellValue = cellValue.filter(item => item);
        if (cellValue.length === 0) return this.renderEmptyFormatter();
        return <CollaboratorFormatter value={cellValue} collaborators={collaborators} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.LONG_TEXT: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <LongTextFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.IMAGE: {
        if (!cellValue || (Array.isArray(cellValue) && cellValue.length === 0)) return this.renderEmptyFormatter();
        return <ImageFormatter
          value={cellValue}
          containerClassName={containerClassName}
          isSupportPreview={true}
          readOnly={true}
          downloadImage={this.downloadImage}
        />;
      }
      case CELL_TYPE.FILE: {
        if (!cellValue || (Array.isArray(cellValue) && cellValue.length === 0)) return this.renderEmptyFormatter();
        return <FileFormatter value={cellValue ? cellValue.filter(item => !!item) : []} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.GEOLOCATION : {
        if (!cellValue) return this.renderEmptyFormatter();
        return <GeolocationFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.NUMBER: {
        if (!cellValue && cellValue !== 0) return this.renderEmptyFormatter();
        return <NumberFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.DATE: {
        if (!cellValue || typeof cellValue !== 'string') return this.renderEmptyFormatter();
        const { data } = column;
        const { format } = data || {};
        return <DateFormatter value={cellValue.replace('T', ' ').replace('Z', '')} format={format} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.MULTIPLE_SELECT: {
        if (!cellValue || cellValue.length === 0) return this.renderEmptyFormatter();
        const { data } = column;
        const { options } = data || {};
        return <MultipleSelectFormatter value={cellValue} options={options || []} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.SINGLE_SELECT: {
        if (!cellValue) return this.renderEmptyFormatter();
        const { data } = column;
        const { options } = data || {};
        return <SingleSelectFormatter value={cellValue} options={options || []} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.CHECKBOX: {
        return <CheckboxFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.CTIME: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <CTimeFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.MTIME: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <MTimeFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.CREATOR:
      case CELL_TYPE.LAST_MODIFIER: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <CreatorFormatter
          collaborators={collaborators}
          value={cellValue}
          containerClassName={containerClassName}
          getUserCommonInfo={this.props.getUserCommonInfo}
          renderEmptyFormatter={this.renderEmptyFormatter}
        />;
      }
      case CELL_TYPE.AUTO_NUMBER: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <AutoNumberFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.URL: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <UrlFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.EMAIL: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <EmailFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.DURATION: {
        if (!cellValue) return this.renderEmptyFormatter();
        const { data } = column;
        const { duration_format } = data || {};
        return <DurationFormatter value={cellValue} format={duration_format} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.RATE: {
        return <RateFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName}/>;
      }
      case CELL_TYPE.BUTTON: {
        return <ButtonFormatter data={column.data || {}} containerClassName={containerClassName} optionColors={this.props.getOptionColors()}/>;
      }
      case CELL_TYPE.FORMULA:
      case CELL_TYPE.LINK_FORMULA: {
        if (!cellValue && cellValue !== 0) return this.renderEmptyFormatter();
        const { linked_column_type, linked_column_data, data } = column;
        const { result_type: resultType } = data;
        let value = cellValue;
        if (Array.isArray(cellValue)) {
          value = getFormulaArrayValue(cellValue);
          if (linked_column_type === CELL_TYPE.DATE || resultType === FORMULA_RESULT_TYPE.DATE) {
            value = value.map(item => item.replace('T', ' ').replace('Z', ''));
          } else if ((linked_column_type === CELL_TYPE.FORMULA || linked_column_type === CELL_TYPE.LINK_FORMULA)
            && linked_column_data.result_type === FORMULA_RESULT_TYPE.DATE) {
            value = value.map(item => item.replace('T', ' ').replace('Z', ''));
          }
        } else {
          if (resultType === FORMULA_RESULT_TYPE.DATE) {
            value = value.replace('T', ' ').replace('Z', '');
          }
        }

        return (
          <FormulaFormatter
            value={value}
            column={column}
            tables={tables}
            collaborators={collaborators}
            containerClassName={containerClassName}
          />
        );
      }
      case CELL_TYPE.LINK: {
        if (!Array.isArray(cellValue) || cellValue.length === 0) return null;
        return (
          <LinkFormatter
            value={cellValue}
            column={column}
            collaborators={collaborators}
            containerClassName={containerClassName}
            renderEmptyFormatter={this.renderEmptyFormatter}
            getOptionColors={this.props.getOptionColors}
            getUserCommonInfo={this.props.getUserCommonInfo}
            getCellValueDisplayString={this.props.getCellValueDisplayString}
          />
        );
      }
      default:
        return this.renderEmptyFormatter();
    }
  }

  render() {
    return (
      <Fragment>
        {this.renderFormatter()}
      </Fragment>
    );
  }
}

CellFormatter.propTypes = {
  column: PropTypes.object.isRequired,
  cellValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number, PropTypes.string, PropTypes.object, PropTypes.array]),
  tables: PropTypes.array,
  collaborators: PropTypes.array,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getCellValueDisplayString: PropTypes.func,
};

export default CellFormatter;
