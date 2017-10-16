import PropTypes from "prop-types";
import React from "react";

import DeleteIcon from "mdi-react/DeleteIcon";

export default class extends React.Component {
  static displayName = "ImageryLocation";

  static propTypes = {
    onValueChange: PropTypes.func,
    removeImageryLocation: PropTypes.func,
    renderErrorMessage: PropTypes.func,
    getValidationMessages: PropTypes.func,
    handleValidation: PropTypes.func,
    sceneName: PropTypes.string,
    sceneId: PropTypes.string,
    index: PropTypes.number,
    validationName: PropTypes.string,
    total: PropTypes.number,
    data: PropTypes.object
  };

  getName = fieldName => {
    return `${this.props.sceneName}[${this.props.index}][${fieldName}]`;
  };

  getId = fieldName => {
    return `${this.props.sceneId}-${this.props.index}-${fieldName}`;
  };

  onChange = (fieldName, e) => {
    // fieldIndex, fieldName, fieldValue
    this.props.onValueChange(this.props.index, fieldName, e.target.value);
  };

  onChangeFile = (fieldName, e) => {
    // fieldIndex, fieldName, fieldValue
    this.props.onValueChange(this.props.index, fieldName, e.target.files[0]);
  };

  renderRemoveBtn = () => {
    // var classes = 'bttn-remove-imagery' + (this.props.total <= 1 ? ' disabled' : '');
    return (
      <div className="form-img-actions">
        <a
          type="button"
          className="bttn-remove-imagery"
          onClick={this.props.removeImageryLocation.bind(
            null,
            this.props.index
          )}
          title="Remove dataset"
        >
          <DeleteIcon />
        </a>
      </div>
    );
  };

  renderInput = () => {
    // Just to shorten.
    var i = this.props.index;
    let opts = {};
    let validationName = this.props.validationName + "." + i + ".url";
    switch (this.props.data.origin) {
      case "upload":
        validationName = this.props.validationName + "." + i + ".file";
        opts = {
          name: this.getName("url"),
          id: this.getId("url"),
          onChange: e => {
            this.onChangeFile("upload", e);
            this.props.handleValidation(validationName)(e);
          }
        };
        return (
          <div>
            <input
              type="file"
              className=""
              placeholder="Local file"
              {...opts}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages(validationName)[0]
            )}
          </div>
        );
      case "manual":
        opts = {
          name: this.getName("url"),
          id: this.getId("url"),
          onBlur: this.props.handleValidation(validationName),
          onChange: this.onChange.bind(null, "url"),
          value: this.props.data.url
        };
        return (
          <div>
            <input
              type="url"
              className="form-control"
              placeholder="Imagery url"
              {...opts}
            />
            {this.props.renderErrorMessage(
              this.props.getValidationMessages(validationName)[0]
            )}
          </div>
        );
      case "dropbox":
      case "gdrive":
        if (this.props.data.url === "") {
          return <p>Loading file selector. Please wait...</p>;
        }

        opts = {
          name: this.getName("url"),
          id: this.getId("url"),
          readOnly: true,
          value: this.props.data.url
        };
        return <input type="url" className="form-control" {...opts} />;
      default:
        return null;
    }
  };

  render() {
    // Just to shorten.
    return (
      <div className="imagery-location-fieldset">
        {this.renderRemoveBtn()}
        <div className="imagery-location">{this.renderInput()}</div>
      </div>
    );
  }
}
