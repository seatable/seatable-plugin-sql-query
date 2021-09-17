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
  CreatorFormatter,
  LastModifierFormatter,
  MTimeFormatter,
  AutoNumberFormatter,
  UrlFormatter,
  EmailFormatter,
  DurationFormatter,
  RateFormatter,
  ButtonFormatter,
} from 'dtable-ui-component';
import { CELL_TYPE } from 'dtable-sdk';
import { isValidEmail, getValueFromPluginConfig } from '../../utils/common-utils';
import FormulaFormatter from './formula-formatter';

const propTypes = {
  column: PropTypes.object.isRequired,
  cellValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number, PropTypes.string, PropTypes.object, PropTypes.array]),
  collaborators: PropTypes.array,
  getOptionColors: PropTypes.func,
  getUserCommonInfo: PropTypes.func
};

class CellFormatter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    };
  }

  componentDidMount() {
    this.calculateCollaboratorData(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.calculateCollaboratorData(nextProps);
  }

  calculateCollaboratorData = (props) => {
    const { cellValue, column } = props;
    const { type } = column;
    if (type === CELL_TYPE.LAST_MODIFIER) {
      this.getCollaborator(cellValue);
    } else if (type === CELL_TYPE.CREATOR) {
      this.getCollaborator(cellValue);
    }
  }

  getCollaborator = (value) => {
    if (!value) {
      this.setState({ isDataLoaded: true, collaborator: null });
      return;
    }
    this.setState({ isDataLoaded: false, collaborator: null });
    const { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({ isDataLoaded: true, collaborator });
      return;
    }

    const mediaUrl = getValueFromPluginConfig('mediaUrl');
    const defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
    if (value === 'anonymous') {
      collaborator = {
        name: 'anonymous',
        avatar_url: defaultAvatarUrl,
      };
      this.setState({ isDataLoaded: true, collaborator });
      return;
    }

    let dtableCollaborators = window.app.collaboratorsCache;
    collaborator = dtableCollaborators[value];
    if (collaborator) {
      this.setState({ isDataLoaded: true, collaborator });
      return;
    }

    if (!isValidEmail(value)) {
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      dtableCollaborators[value] = collaborator;
      this.setState({ isDataLoaded: true, collaborator });
      return;
    }
    
    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      dtableCollaborators[value] = collaborator;
      this.setState({ isDataLoaded: true, collaborator });
    }).catch(() => {
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      dtableCollaborators[value] = collaborator;
      this.setState({ isDataLoaded: true, collaborator });
    });
  }

  renderEmptyFormatter = () => {
    return null;
  }

  downloadImage = (url) => {
    let seafileFileIndex = url.indexOf('seafile-connector');
    if (seafileFileIndex > -1) return;
    window.location.href = url + '?dl=1';
  }

  renderFormatter = () => {
    let { column, cellValue, collaborators } = this.props;
    const { type: columnType } = column || {};
    const { isDataLoaded, collaborator } = this.state;
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
        return <GeolocationFormatter value={cellValue} containerClassName={containerClassName} />;
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
      case CELL_TYPE.CREATOR: {
        if (!cellValue || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          return <CreatorFormatter collaborators={[collaborator]} value={cellValue} containerClassName={containerClassName} />;
        }
        return this.renderEmptyFormatter();
      }
      case CELL_TYPE.LAST_MODIFIER: {
        if (!cellValue || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          return <LastModifierFormatter collaborators={[collaborator]} value={cellValue} containerClassName={containerClassName} />;
        }
        return this.renderEmptyFormatter();
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
        return <FormulaFormatter value={cellValue} column={column} collaborators={collaborators} containerClassName={containerClassName} renderEmptyFormatter={this.renderEmptyFormatter} />;
      }
      case CELL_TYPE.LINK: {
        if (!Array.isArray(cellValue) || cellValue.length === 0) return null;
        return (
          <div className={containerClassName}>
            {cellValue.map((item, index) => {
              const { display_value, row_id } = item;
              return (
                <div key={`${row_id}-${index}`} className="sql-query-link-item">{display_value}</div>
              );
            })}
          </div>
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

CellFormatter.propTypes = propTypes;

export default CellFormatter;
