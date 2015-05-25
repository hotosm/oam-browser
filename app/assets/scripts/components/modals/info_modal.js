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
        <h2>What</h2>
        <p>OpenAerialMap (OAM) is a collection of openly licensed satellite and unmanned aerial vehicle (UAV) imagery. OAM is an open serivce that will provide storage and search of this imagery.</p>
        <h2>Why</h2>
        <p>Imagery is being generated more and more, however after a disaster it is difficult to determine what imagery is available and where to access it. OAM seeks to solve this by providing a simple, open way to process and provide imagery for humanitarian response and disaster preparedness.</p>
        <h2>Join</h2>
        <p>There are plenty of ways to get involved in OpenAerialMap. Check out the <a href="https://github.com/hotosm/OpenAerialMap" title="Visit the GitHub repository">GitHub repository</a> to learn more about the design and how to get involved in the project.</p>
      </div>
    );
  },

  getFooter: function() {
    return (
      <p>Made with love by <a href="http://developmentseed.com/" title="Visit Development Seed website">Development Seed</a> and <a href="http://hot.openstreetmap.org/" title="Visit the Humanitarian OpenStreetMap Team website">HOT</a>.</p>
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