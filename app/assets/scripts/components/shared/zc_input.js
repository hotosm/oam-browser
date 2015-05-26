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
        {/* 
        <span className="input-group-bttn drop dropdown open center">
          <a href="#" title="Show options" className="bttn-uoptions" data-toggle="drop"><span>Options</span></a>
          <div className="drop-content">
            <ul className="drop-menu tms-options-menu" role="menu">
              <li className="has-icon-bef clipboard disabled"><a href="" target="_blank" title="Open with iD editor">Open with iD editor</a></li>
              <li className="has-icon-bef clipboard disabled"><a href="" target="_blank" title="Open with JOSM">Open with JOSM</a></li>
              <li className="has-icon-bef clipboard"><a href="" title="Copy to clipboard" data-hook="copy:trigger">Copy to clipboard</a></li>
            </ul>
          </div>
        </span>
        */}
      </div>
    );
  }
})

module.exports = ZcInput;