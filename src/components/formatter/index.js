import React from 'react';
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
      this.setState({isDataLoaded: true, collaborator: null});
      return;
    }
    this.setState({isDataLoaded: false, collaborator: null});
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = getValueFromPluginConfig('mediaUrl');
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }
    
    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({isDataLoaded: true, collaborator: collaborator});
    }).catch(() => {
      let mediaUrl = getValueFromPluginConfig('mediaUrl');
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
    });
  }

  renderEmptyFormatter = () => {
    return null;
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
        return <ImageFormatter value={cellValue} containerClassName={containerClassName}/>;
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
        return <NumberFormatter value={cellValue} data={column.data} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.DATE: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <DateFormatter value={cellValue.replace('T', ' ').replace('Z', '')} format={column.data.format} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.MULTIPLE_SELECT: {
        if (!cellValue || cellValue.length === 0) return this.renderEmptyFormatter();
        return <MultipleSelectFormatter value={cellValue} options={column.data.options} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.SINGLE_SELECT: {
        if (!cellValue) return this.renderEmptyFormatter();
        return <SingleSelectFormatter value={cellValue} options={column.data.options} containerClassName={containerClassName} />;
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
        return <DurationFormatter value={cellValue} format={column.data.duration_format} containerClassName={containerClassName} />;
      }
      case CELL_TYPE.RATE: {
        return <RateFormatter value={cellValue} data={column.data || {}} containerClassName={containerClassName}/>;
      }
      case CELL_TYPE.BUTTON: {
        return <ButtonFormatter data={column.data || {}} containerClassName={containerClassName} optionColors={this.props.getOptionColors()}/>;
      }
      default:
        return this.renderEmptyFormatter();
    }
  }

  render() {
    return(
      <div className="sql-query-cell-content text-truncate">
        {this.renderFormatter()}
      </div>
    );
  }
}

CellFormatter.propTypes = propTypes;

export default CellFormatter;
