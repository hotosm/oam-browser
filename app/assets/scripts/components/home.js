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
var cookie = require('../utils/cookie');
var utils = require('../utils/utils');
var actions = require('../actions/actions');
var config = require('../config.js');

var Home = React.createClass({
  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQueryChanged'),
    Reflux.listenTo(mapStore, "onMapStoreData"),
    Router.Navigation,
    Router.State
  ],

  getInitialState: function() {
    return {
      results: [],
      map: {
        view: null
      },
      selectedSquareQuadkey: null,
      selectedItemId: null
    }
  },

  onMapStoreData: function() {
    console.log('onMapStoreData', mapStore.storage);
    this.setState({
      results: mapStore.getResults()
    });
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
    // The map parameters form the url take precedence over everything else
    // if they're not present try the cookie.
    state.map.view = this.props.params.map ? this.props.params.map : cookie.read('oam-browser:map-view');
    // No router map and no cookie?
    // Use initial from config.
    if (state.map.view === null) {
      state.map.view = config.map.initialView.concat(config.map.initialZoom).join(',');
    }


    state.selectedSquareQuadkey = this.props.params.square;
    state.selectedItemId = this.props.params.item_id;
    this.setState(state);
  },

  componentWillReceiveProps: function(nextProps) {
    var state = _.cloneDeep(this.state);
    // Map view.
    if (this.props.params.map != nextProps.params.map) {
      state.map.view = nextProps.params.map;
      // Map view changed. Store cookie.
      cookie.create('oam-browser:map-view', state.map.view);
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
    if (this.props.params.square != nextProps.params.square && nextProps.params.square) {
      console.log('Home component quadkey changed', nextProps.params.square);
      var bbox = utils.tileBboxFromQuadkey(nextProps.params.square);
      actions.selectedBbox(bbox);
    }

    // Selected Square
    if (this.props.params.item_id != nextProps.params.item_id) {
      state.selectedItemId = nextProps.params.item_id;
    }

    // Set State
    this.setState(state);
  },

  componentDidMount: function() {
    if (this.state.selectedSquareQuadkey  ) {
      console.log('Home component mounted with quadkey', this.state.selectedSquareQuadkey);
      var bbox = utils.tileBboxFromQuadkey(this.state.selectedSquareQuadkey);
      actions.selectedBbox(bbox);
    }
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
          selectedItem={selectedItem} />

        <MiniMap selectedSquare={this.props.params.square} mapView={this.state.map.view}/>

        <ResultsPane
                  results={this.state.results}
                  selectedItemId={this.state.selectedItemId}
                  selectedSquare={this.state.selectedSquareQuadkey} />
      </div>
    );
  }
});

module.exports = Home;