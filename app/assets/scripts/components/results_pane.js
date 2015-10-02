'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var Keys = require('react-keybinding');
var ResultsList = require('./results_list');
var ResultsItem = require('./results_item');
var resultsStore = require('../stores/results_store');
var mapStore = require('../stores/map_store');
var actions = require('../actions/actions');

var ResultsPane = React.createClass({
  mixins: [
    Reflux.listenTo(resultsStore, "onResults"),
    Router.Navigation,
    Router.State,
    Keys
  ],

  keybindings: {
    'esc': function() {
      if (this.state.results.length === 0) {
        return;
      }
      actions.mapSquareUnselected();
    }
  },

  // We only want to load the item from the id in the path the first time the
  // "page" is loaded.
  // More on how the router works can be found in routes.js
  loadFromRouter: true,

  onResults: function(data) {
    this.setState({
      results: data.results,
      selectedItem: data.selectedItem,
      selectedItemIndex: data.selectedItemIndex
    });
console.log('resultsPane');
    // No square selected. Do not update route.
    // if (!mapStore.isSelectedSquare()) {
    //   return;
    // }

    // var params = this.getParams();
    // var route = 'results';
    // if (data.selectedItem) {
    //   route = 'item';
    //   params.item_id = data.selectedItem._id
    // }
    // this.replaceWith(route, params, this.getQuery());
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

  componentWillUpdate: function(nextProps, nextState) {
    // var params = this.getParams();
    // // if:
    // //  - didn't load already
    // //  - there's an id in the url
    // //  - there are results
    // if (this.loadFromRouter && params.item_id && nextState.results.length) {
    //   this.loadFromRouter = false;
    //   // Search for the item to trigger the action.
    //   for (var i in nextState.results) {
    //     if (nextState.results[i]._id == params.item_id) {
    //       actions.resultItemSelect(nextState.results[i]);
    //     }
    //   }
    // }
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
          <a href="" onClick={this.closeResults} className="pane-dismiss" title="Exit selection"><span>Close</span></a>
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
