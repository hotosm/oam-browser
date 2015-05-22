'use strict';
var React = require('react');
var MapBoxMap = require('./map');
var ResultsPane = require('./results_pane');

var Home = React.createClass({
  render: function() {
    return (
      <div>
        <MapBoxMap />
        <ResultsPane />
      </div>
    );
  }
});

module.exports = Home;