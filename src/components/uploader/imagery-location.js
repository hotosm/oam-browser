var React = require('react');

module.exports = React.createClass({
  displayName: 'ImageryLocation',

  propTypes: {
    onValueChange: React.PropTypes.func,
    removeImageryLocation: React.PropTypes.func,
    renderErrorMessage: React.PropTypes.func,
    getValidationMessages: React.PropTypes.func,
    handleValidation: React.PropTypes.func,
    sceneName: React.PropTypes.string,
    sceneId: React.PropTypes.string,
    index: React.PropTypes.number,
    validationName: React.PropTypes.string,
    total: React.PropTypes.number,
    data: React.PropTypes.object
  },

  getName: function (fieldName) {
    return `${this.props.sceneName}[${this.props.index}][${fieldName}]`;
  },

  getId: function (fieldName) {
    return `${this.props.sceneId}-${this.props.index}-${fieldName}`;
  },

  onChange: function (fieldName, e) {
    // fieldIndex, fieldName, fieldValue
    this.props.onValueChange(this.props.index, fieldName, e.target.value);
  },

  onChangeFile: function (fieldName, e) {
    // fieldIndex, fieldName, fieldValue
    this.props.onValueChange(this.props.index, fieldName, e.target.files[0]);
  },

  renderRemoveBtn: function () {
    // var classes = 'bttn-remove-imagery' + (this.props.total <= 1 ? ' disabled' : '');
    return (
      <div className='form-img-actions'>
        <button type='button' className='bttn-remove-imagery' onClick={this.props.removeImageryLocation.bind(null, this.props.index)} title='Remove dataset'><span>Remove dataset</span></button>
      </div>
    );
  },

  renderInput: function () {
    // Just to shorten.
    var i = this.props.index;
    let opts = {};
    let validationName = this.props.validationName + '.' + i + '.url';
    switch (this.props.data.origin) {
      case 'upload':
        validationName = this.props.validationName + '.' + i + '.file';
        opts = {
          name: this.getName('url'),
          id: this.getId('url'),
          onChange: (e) => { this.onChangeFile('upload', e); this.props.handleValidation(validationName)(e); }
        };
        return (
          <div>
            <input type='file' className='' placeholder='Local file' {...opts} />
            {this.props.renderErrorMessage(this.props.getValidationMessages(validationName)[0])}
          </div>
        );
      case 'manual':
        opts = {
          name: this.getName('url'),
          id: this.getId('url'),
          onBlur: this.props.handleValidation(validationName),
          onChange: this.onChange.bind(null, 'url'),
          value: this.props.data.url
        };
        return (
          <div>
            <input type='url' className='form-control' placeholder='Imagery url' {...opts} />
            {this.props.renderErrorMessage(this.props.getValidationMessages(validationName)[0])}
          </div>
        );
      case 'dropbox':
      case 'gdrive':
        if (this.props.data.url === '') {
          return <p>Loading file selector. Please wait...</p>;
        }

        opts = {
          name: this.getName('url'),
          id: this.getId('url'),
          readOnly: true,
          value: this.props.data.url
        };
        return (
          <input type='url' className='form-control' {...opts} />
        );
      default:
        return null;
    }
  },

  render: function () {
    // Just to shorten.
    return (
      <div className='imagery-location-fieldset'>
        {this.renderRemoveBtn()}
        <div className='imagery-location'>
          {this.renderInput()}
        </div>
      </div>
    );
  }
});
