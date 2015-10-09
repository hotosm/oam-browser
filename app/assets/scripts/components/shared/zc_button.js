'use strict';
var React = require('react');
var ZeroClipboard = require('zeroclipboard');

var ZcButton = React.createClass({
   propTypes: {
    onCopy: React.PropTypes.func.isRequired,
  },

  getDefaultProps: function() {
    return {
      title: '',
      className: '',
      text: '',
    }
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    ZeroClipboard.config({
      swfPath: "/ZeroClipboard.swf",
      hoverClass: "zc-hover",
      activeClass: "zc-active",
    });

    var _this = this;
    var el = this.getDOMNode();
    var client = new ZeroClipboard(el);
    client.on( "ready", function( readyEvent ) {
      console.log( "ZeroClipboard SWF is ready!" );

      el.classList.remove('disabled');

      client.on( 'copy', function(event) {
        var toCopy = _this.props.onCopy(event);
        if (toCopy === false) {
          return;
        }
        event.clipboardData.setData('text/plain', toCopy);
      });

    });
  },

  onCopyClick: function(e) {
    e.preventDefault();
  },

  render: function() {
    return (
      <a href="#" title={this.props.title} className={this.props.className} onClick={this.onCopyClick}><span>{this.props.text}</span></a>
    );
  }
})

module.exports = ZcButton;