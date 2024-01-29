import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { SELECT_OPTION_COLORS } from 'dtable-utils';
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
  DepartmentSingleSelectFormatter,
} from 'dtable-ui-component';
import { CellType } from 'dtable-utils';
import CreatorFormatter from './creator-formatter';
import LinkFormatter from './link-formatter';
import FormulaFormatter from './formula-formatter';
import { UNKNOWN_TYPE } from '../../constants';

class CellFormatter extends React.Component {

  renderEmptyFormatter = () => {
    const { component } = this.props;
    const { emptyComponent } = component || {};
    return emptyComponent || null;
  };

  downloadImage = (url) => {
    let seafileFileIndex = url.indexOf('seafile-connector');
    if (seafileFileIndex > -1) return;
    window.location.href = url + '?dl=1';
  };

  renderFormatter = () => {
    let { column, cellValue, isSample } = this.props;
    const { collaborators, departments } = window.app.state;
    const { type: columnType } = column || {};
    const containerClassName = `sql-query-${columnType}-formatter`;

    switch (columnType) {
      case CellType.TEXT: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <TextFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.COLLABORATOR: {
        if (!Array.isArray(cellValue) || cellValue.length === 0) return this.renderEmptyFormatter();
        cellValue = cellValue.filter(item => item);
        if (cellValue.length === 0) return this.renderEmptyFormatter();
        return <CollaboratorFormatter value={cellValue} collaborators={collaborators} containerClassName={containerClassName} />;
      }
      case CellType.LONG_TEXT: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <LongTextFormatter isSample={isSample} value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.IMAGE: {
        if (!cellValue || (Array.isArray(cellValue) && cellValue.length === 0)) return this.renderEmptyFormatter();
        return <ImageFormatter
          value={cellValue}
          containerClassName={containerClassName}
          isSupportPreview={true}
          readOnly={true}
          downloadImage={this.downloadImage}
          isSample={isSample}
        />;
      }
      case CellType.FILE: {
        if (!cellValue || (Array.isArray(cellValue) && cellValue.length === 0)) return this.renderEmptyFormatter();
        return <FileFormatter value={cellValue ? cellValue.filter(item => !!item) : []} isSample={isSample} containerClassName={containerClassName} />;
      }
      case CellType.GEOLOCATION : {
        if (!cellValue) return this.renderEmptyFormatter();
        return <GeolocationFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName} />;
      }
      case CellType.NUMBER: {
        if (!cellValue && cellValue !== 0) return this.renderEmptyFormatter();
        return <NumberFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName} />;
      }
      case CellType.DATE: {
        if (!cellValue || typeof cellValue !== 'string') return this.renderEmptyFormatter();
        const { data } = column;
        const { format } = data || {};
        return <DateFormatter value={cellValue} format={format} containerClassName={containerClassName} />;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!cellValue || cellValue.length === 0) return this.renderEmptyFormatter();
        const { data } = column;
        const { options } = data || {};
        return <MultipleSelectFormatter value={cellValue} options={options || []} containerClassName={containerClassName} />;
      }
      case CellType.SINGLE_SELECT: {
        if (!cellValue) return this.renderEmptyFormatter();
        const { data } = column;
        const { options } = data || {};
        return <SingleSelectFormatter value={cellValue} options={options || []} containerClassName={containerClassName} />;
      }
      case CellType.DEPARTMENT_SINGLE_SELECT: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <DepartmentSingleSelectFormatter value={cellValue} departments={departments} containerClassName={containerClassName} />;
      }
      case CellType.CHECKBOX: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <CheckboxFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.CTIME: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <CTimeFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.MTIME: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <MTimeFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.CREATOR:
      case CellType.LAST_MODIFIER: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <CreatorFormatter
          cellValue={cellValue}
          containerClassName={containerClassName}
          getUserCommonInfo={this.props.getUserCommonInfo}
          renderEmptyFormatter={this.renderEmptyFormatter}
        />;
      }
      case CellType.AUTO_NUMBER: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <AutoNumberFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.URL: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <UrlFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.EMAIL: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <EmailFormatter value={cellValue} containerClassName={containerClassName} />;
      }
      case CellType.DURATION: {
        if (!cellValue) return this.renderEmptyFormatter();
        const { data } = column;
        const { duration_format } = data || {};
        return <DurationFormatter value={cellValue} format={duration_format} containerClassName={containerClassName} />;
      }
      case CellType.RATE: {
        return <RateFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName}/>;
      }
      case CellType.BUTTON: {
        return <ButtonFormatter data={column.data || {}} containerClassName={containerClassName} optionColors={SELECT_OPTION_COLORS}/>;
      }
      case CellType.FORMULA:
      case CellType.LINK_FORMULA: {
        return (
          <FormulaFormatter
            cellValue={cellValue}
            column={column}
            containerClassName={containerClassName}
            renderEmptyFormatter={this.renderEmptyFormatter}
          />
        );
      }
      case CellType.LINK: {
        if (!Array.isArray(cellValue) || cellValue.length === 0) return null;
        return (
          <LinkFormatter
            value={cellValue}
            column={column}
            containerClassName={containerClassName}
            cellValueUtils={this.props.cellValueUtils}
            renderEmptyFormatter={this.renderEmptyFormatter}
            getUserCommonInfo={this.props.getUserCommonInfo}
          />
        );
      }
      case UNKNOWN_TYPE: {
        const displayValue = this.props.cellValueUtils.getUnknownDisplayString(cellValue);
        if (!displayValue) return this.renderEmptyFormatter();
        return <TextFormatter value={displayValue} containerClassName={`${containerClassName} sql-query-text-formatter`} />;
      }
      default:
        return this.renderEmptyFormatter();
    }
  };

  render() {
    return (
      <Fragment>
        {this.renderFormatter()}
      </Fragment>
    );
  }
}

CellFormatter.propTypes = {
  isSample: PropTypes.bool,
  column: PropTypes.object.isRequired,
  cellValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number, PropTypes.string, PropTypes.object, PropTypes.array]),
  cellValueUtils: PropTypes.object,
  component: PropTypes.object,
  getUserCommonInfo: PropTypes.func,
};

export default CellFormatter;
