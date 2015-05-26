'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var BModal = require('./base_modal');

var InfoModal = React.createClass({
  getHeader: function() {
    return (<h1 className="modal-title">About</h1>);
  },

  getBody: function() {
    return (
      <div className="prose">
        <h2>OpenAerialMap</h2>
        <p>OpenAerialMap (OAM) is a set of tools for searching, sharing, and using openly licensed satellite and unmanned aerial vehicle (UAV) imagery.</p>
        <p>Built on top of the <a href="https://github.com/openimagerynetwork" title="Visit the GitHub repository">Open Imagery Network (OIN)</a>, OAM is an open service that will provide search and access to this imagery.</p>
        <h2>How to use?</h2>
        <p>Use the map to pan and zoom to search available imagery. Available imagery can be previewed by selecting a tile and browsing the imagery in the sidebar.</p>
        <p>All imagery is publicly licensed and made available through the Humanitarian OpenStreetMap Team&#39;s Beta OIN Node.</p>
        <h2>Join in the Development</h2>
        <p>OAM is releasing a beta version to preview and test functionality. There are plenty of ways to get involved in OpenAerialMap.</p>
        <p>Check out the <a href="https://github.com/hotosm/OpenAerialMap" title="Visit the GitHub repository">GitHub repository</a> to learn more about the design and how to get involved in the project.</p>
      </div>
    );
  },

  getFooter: function() {
    return (
      <p>Made with love by <a href="https://developmentseed.org" title="Visit Development Seed website">Development Seed</a> and <a href="http://hot.openstreetmap.org/" title="Visit the Humanitarian OpenStreetMap Team website">HOT</a>.</p>
    );
  },

  render: function () {
    return (
      <BModal
        type="info"
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()} />
    );
  }
});

module.exports = InfoModal;  