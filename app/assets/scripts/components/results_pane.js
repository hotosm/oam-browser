'use strict';
var React = require('react/addons');
var Router = require('react-router');
var Keys = require('react-keybinding');
var _ = require('lodash');
var ResultsList = require('./results_list');
var ResultsItem = require('./results_item');

var ResultsPane = React.createClass({
  displayName: 'ResultsPane',

  propTypes: {
    results: React.PropTypes.array,
    selectedItemId: React.PropTypes.string,
    selectedSquare: React.PropTypes.string
  },

  mixins: [
    Router.Navigation,
    Router.State,
    Keys
  ],

  keybindings: {
    'esc': function () {
      if (this.props.results.length === 0) {
        return;
      }
      this.closeResults();
    }
  },

  closeResults: function (e) {
    if (e) {
      e.preventDefault();
    }
    var p = this.getParams();
    this.transitionTo('map', {
      map: p.map
    }, this.getQuery());
  },

  render: function () {
    console.log('results pane render', this.props);

    var resultsPane = null;
    if (this.props.results.length && this.props.selectedItemId) {
      var i = _.findIndex(this.props.results, {_id: this.props.selectedItemId});
      var pg = {
        total: this.props.results.length,
        current: i + 1,
        prevId: i > 0 ? this.props.results[i - 1]._id : null,
        nextId: i < this.props.results.length - 1 ? this.props.results[i + 1]._id : null
      };
      resultsPane = <ResultsItem data={this.props.results[i]} pagination={pg} />;
    } else if (this.props.results.length && this.props.selectedSquare) {
      resultsPane = <ResultsList results={this.props.results} selectedSquare={this.props.selectedSquare}/>;
    } else {
      // No results, no pane.
      return null;
    }

    return (
      <div id='results-pane' className='pane'>
        <a href='' onClick={this.closeResults} className='pane-dismiss' title='Exit selection'><span>Close</span></a>
        {resultsPane}
      </div>
    );
  }
});

module.exports = ResultsPane;
