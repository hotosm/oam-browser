'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var _ = require('lodash');
var MapBoxMap = require('./map');
var MiniMap = require('./minimap');
var ResultsPane = require('./results_pane');
var mapStore = require('../stores/map_store');
var searchQueryStore = require('../stores/search_query_store');

var Home = React.createClass({
  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQueryChanged'),
    Reflux.listenTo(mapStore, "onResults"),
    Router.Navigation,
    Router.State
  ],

  getInitialState: function() {
    return {
      results: [],
      map: {
        styleProperty: 'all_all_all_count',
        view: null
      },
      selectedSquareQuadkey: null,
      selectedItemId: null
    }
  },

  onResults: function(results) {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('Home controller', 'onResults', results);
    console.log('onResults router', this.getParams());
    this.setState({
      results: results,
    });
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  },

  // Action listener
  onSearchQueryChanged: function(params) {
    console.log('home onSearchQueryChanged');
    var mapState = _.cloneDeep(this.state.map);
    mapState.styleProperty = params.date + '_' + params.resolution + '_' + params.dataType + '_count';
    console.log('changing map style', mapState.styleProperty);
    this.setState({map: mapState});
  },

  componentWillMount: function() {
    var state = _.cloneDeep(this.state);
    state.map.view = this.props.params.map;
    state.selectedSquareQuadkey = this.props.params.square;
    state.selectedItemId = this.props.params.item_id;
    this.setState(state);
  },

  componentWillReceiveProps: function(nextProps) {
    var state = _.cloneDeep(this.state);
    // Map view.
    if (this.props.params.map != nextProps.params.map) {
      state.map.view = nextProps.params.map;
    }

    // Selected Square
    if (this.props.params.square != nextProps.params.square) {
      state.selectedSquareQuadkey = nextProps.params.square;
    }
    // If the square was set and it's not anymore means that the results
    // have been dismissed.
    if (this.props.params.square && !nextProps.params.square) {
      console.log('componentWillReceiveProps -- results pane was dismissed');
      // Clean the results.
      state.results = [];
    }

    // Selected Square
    if (this.props.params.item_id != nextProps.params.item_id) {
      state.selectedItemId = nextProps.params.item_id;
    }

    // Set State
    this.setState(state);
  },

  render: function() {
    var selectedItem = _.find(this.state.results, {_id: this.state.selectedItemId});

    var params = {
      map: this.state.map.view,
      square: this.state.selectedSquareQuadkey,
      item_id: this.state.selectedItemId,
    }

    return (
      <div>
        <MapBoxMap
          params={params}
          styleProperty={this.state.map.styleProperty}
          selectedItem={selectedItem} />

        <MiniMap selectedSquare={this.props.params.square} />

        <ResultsPane
          results={this.state.results}
          selectedItemId={this.state.selectedItemId}
          selectedSquare={this.state.selectedSquareQuadkey} />
      </div>
    );
  }
});

module.exports = Home;