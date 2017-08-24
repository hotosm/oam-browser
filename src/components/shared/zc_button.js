import React from 'react';
import Clipboard from 'clipboard';

export default React.createClass({
  displayName: 'ZcButton',

  propTypes: {
    onCopy: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    title: React.PropTypes.string,
    text: React.PropTypes.string
  },

  clipboard: null,

  getDefaultProps: function () {
    return {
      title: '',
      className: 'drop__menu-item clipboard',
      text: ''
    };
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function () {
    this.clipboard = new Clipboard(this.refs.el, {
      text: trigger => this.props.onCopy(trigger)
    });
  },

  componentWillUnmount: function () {
    this.clipboard.destroy();
  },

  onCopyClick: function (e) {
    e.preventDefault();
  },

  render: function () {
    return (
      <a ref='el' href='#' title={this.props.title} className={this.props.className} onClick={this.onCopyClick}><span>{this.props.text}</span></a>
    );
  }
});
