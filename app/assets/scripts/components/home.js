'use strict';
var React = require('react/addons');
var MapBoxMap = require('./map');
var MiniMap = require('./minimap');
var ResultsPane = require('./results_pane');

var Home = React.createClass({
  render: function() {
    return (
      <div>
        <MapBoxMap />
        <MiniMap />
        <ResultsPane />
      </div>
    );
  }
});

module.exports = Home;