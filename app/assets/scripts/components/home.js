'use strict';
var React = require('react');
var Reflux = require('reflux');
var MapBoxMap = require('./map');
var ResultsList = require('./results_list');
var ResultsItem = require('./results_item');
var resultsStore = require('../stores/results_store');
var mapStore = require('../stores/map_store');

var Home = React.createClass({
  mixins: [Reflux.listenTo(resultsStore, "onResults")],

  onResults: function(data) {
    this.setState({
      results: data.results,
      selectedItem: data.selectedItem
    });
  },

  getInitialState: function() {
    return {
      results: [],
      selectedItem: null
    }
  },

  render: function() {
    var resultsPane = null;

    if (mapStore.isSelectedSquare()) {
      if (this.state.selectedItem) {
        resultsPane = <ResultsItem data={this.state.selectedItem} />
      }
      else if (this.state.results.length) {
        resultsPane = <ResultsList results={this.state.results} />
      }
      else {
        resultsPane = 'No results to show.';
      }

      // Add wrapper.
      resultsPane = <div id="results-pane">{resultsPane}</div>
    }

    return (
      <div>
        <MapBoxMap />
        {resultsPane}
      </div>
    );
  }
});

module.exports = Home;