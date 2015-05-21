'use strict';
var React = require('react');
var Reflux = require('reflux');
var MapBoxMap = require('./map');
var ResultsList = require('./results_list');
var ResultsItem = require('./results_item');
var resultsStore = require('../stores/results_store');
var mapStore = require('../stores/map_store');
var actions = require('../actions/actions');

var Home = React.createClass({
  mixins: [Reflux.listenTo(resultsStore, "onResults")],

  onResults: function(data) {
    this.setState({
      results: data.results,
      selectedItem: data.selectedItem,
      selectedItemIndex: data.selectedItemIndex
    });
  },

  getInitialState: function() {
    return {
      results: [],
      selectedItem: null,
      selectedItemIndex: null
    }
  },

  closeResults: function(e) {
    e.preventDefault();
    actions.mapSquareUnselected();
  },

  render: function() {
    var resultsPane = null;

    if (mapStore.isSelectedSquare()) {
      if (this.state.selectedItem) {
        var pg = {
          current: this.state.selectedItemIndex + 1,
          total: this.state.results.length
        }
        resultsPane = <ResultsItem data={this.state.selectedItem} pagination={pg} />
      }
      else if (this.state.results.length) {
        resultsPane = <ResultsList results={this.state.results} />
      }
      else {
        resultsPane = (<p>No results to show.</p>);
      }

      // Add wrapper.
      resultsPane = (
        <div id="results-pane">
          <a href="" onClick={this.closeResults} >close</a>
          {resultsPane}
        </div>
      );
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