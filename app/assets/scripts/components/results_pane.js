'use strict';
var React = require('react');
var Reflux = require('reflux');
var ResultsList = require('./results_list');
var ResultsItem = require('./results_item');
var resultsStore = require('../stores/results_store');
var mapStore = require('../stores/map_store');
var actions = require('../actions/actions');

var ResultsPane = React.createClass({
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
        // No results, no pane.
        return null;
      }

      return (
        <div id="results-pane" className="pane">
          <a href="" onClick={this.closeResults} >close</a>
          {resultsPane}
        </div>
      );
    }
    else {
      return null;
    }
  }
})

module.exports = ResultsPane;