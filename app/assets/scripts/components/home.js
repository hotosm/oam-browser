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
  propTypes: {
    params: React.PropTypes.object
  },

  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQueryChanged'),
    Reflux.listenTo(mapStore, 'onMapStoreData'),
    Router.Navigation,
    Router.State
  ],

  getInitialState: function () {
    return {
      results: [],
      loading: true,
      map: {
        view: null
      },
      selectedSquareQuadkey: null,
      selectedItemId: null,
      filterParams: searchQueryStore.getParameters()
    };
  },

  onMapStoreData: function (what) {
    console.log('onMapStoreData', mapStore.storage);
    var state = _.cloneDeep(this.state);
    state.results = mapStore.getResults();
    state.loading = what === 'squareData' ? false : mapStore.footprintsWereFecthed();
    this.setState(state);
  },

  // Action listener
  onSearchQueryChanged: function (params) {
    console.log('home onSearchQueryChanged');
    this.setState({filterParams: params});
  },

  componentWillMount: function () {
    var state = _.cloneDeep(this.state);
    // The map parameters form the url take precedence over everything else
    // if they're not present try the cookie.
    state.map.view = this.getMapViewOrDefault(this.props.params.map);

    state.selectedSquareQuadkey = this.props.params.square;
    state.selectedItemId = this.props.params.item_id;
    this.setState(state);
  },

  componentWillReceiveProps: function (nextProps) {
    var state = _.cloneDeep(this.state);
    // Map view.
    var nextMapView = this.getMapViewOrDefault(nextProps.params.map);
    if (this.getMapViewOrDefault(this.props.params.map) !== nextMapView) {
      state.map.view = nextMapView;
      // Map view changed. Store cookie.
      cookie.create('oam-browser:map-view', state.map.view);
    }

    // Selected Square
    if (this.props.params.square !== nextProps.params.square) {
      state.selectedSquareQuadkey = nextProps.params.square;
    }
    // If the square was set and it's not anymore means that the results
    // have been dismissed.
    if (this.props.params.square && !nextProps.params.square) {
      console.log('componentWillReceiveProps -- results pane was dismissed');
      // Clean the results.
      state.results = [];
    }
    if (this.props.params.square !== nextProps.params.square && nextProps.params.square) {
      console.log('Home component quadkey changed', nextProps.params.square);
      var bbox = utils.tileBboxFromQuadkey(nextProps.params.square);
      state.loading = true;
      actions.selectedBbox(bbox);
    }

    // Selected Square
    if (this.props.params.item_id !== nextProps.params.item_id) {
      state.selectedItemId = nextProps.params.item_id;
    }

    // Set State
    this.setState(state);
  },

  componentDidMount: function () {
    if (this.state.selectedSquareQuadkey) {
      console.log('Home component mounted with quadkey', this.state.selectedSquareQuadkey);
      var bbox = utils.tileBboxFromQuadkey(this.state.selectedSquareQuadkey);
      actions.selectedBbox(bbox);
    }
  },

  render: function () {
    var selectedItem = _.find(this.state.results, {_id: this.state.selectedItemId});

    return (
      <div>
        {this.state.loading ? <p className="loading revealed">Loading</p> : null}

        <MapBoxMap
          mapView={this.state.map.view}
          selectedSquareQuadkey={this.state.selectedSquareQuadkey}
          selectedItemId={this.state.selectedItemId}
          selectedItem={selectedItem}
          filterParams={this.state.filterParams} />

        <MiniMap selectedSquare={this.props.params.square} mapView={this.state.map.view}/>

        <ResultsPane
          results={this.state.results}
          selectedItemId={this.state.selectedItemId}
          selectedSquare={this.state.selectedSquareQuadkey} />
      </div>
    );
  },

  /**
   * Returns the mapView if valid or the default one.
   * @param  mapView
   *
   * @return mapView
   */
  getMapViewOrDefault: function (mapView) {
    if (!mapView) {
      var cookieView = cookie.read('oam-browser:map-view');
      if (cookieView !== 'undefined' && cookieView !== null) {
        mapView = cookie.read('oam-browser:map-view');
      } else {
        mapView = config.map.initialView.concat(config.map.initialZoom).join(',');
        // Let's correct the cookie value.
        cookie.create('oam-browser:map-view', mapView);
      }
    }
    return mapView;
  }
});

module.exports = Home;
