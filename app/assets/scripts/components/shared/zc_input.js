'use strict';
var React = require('react');
var ZeroClipboard = require('zeroclipboard');

var ZcInput = React.createClass({

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    ZeroClipboard.config({
      swfPath: "/ZeroClipboard.swf",
      hoverClass: "zc-hover",
      activeClass: "zc-active",
    });

    var client = new ZeroClipboard( this.getDOMNode().querySelector('[data-hook="copy:trigger"]') );
    client.on( "ready", function( readyEvent ) {
      console.log( "ZeroClipboard SWF is ready!" );

      client.elements().forEach(function(el) {
        L.DomUtil.removeClass(el, 'disabled');
        el.addEventListener('mouseenter', function(event) {
          event.target.setAttribute('data-title', 'Copy URL to clipboard');
        }, false);
      });

      client.on( 'copy', function(event) {
        event.clipboardData.setData('text/plain', document.querySelector('[data-hook="copy:data"]').value);
        event.target.setAttribute('data-title', 'Copied!');
      });

    });
  },

  render: function() {
    return (
      <div className="input-group">
        <input className="form-control input-m" type="text" value={this.props.value} readOnly  data-hook="copy:data" />
        <span className="input-group-bttn"><button data-title="" type="button" className="bttn-clipboard disabled" data-hook="copy:trigger"><span>Copy to clipboard</span></button></span>
      </div>
    );
  }
})

module.exports = ZcInput;