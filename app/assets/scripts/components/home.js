'use strict';
import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';

import MapBoxMap from './map';
import MiniMap from './minimap';
import ResultsPane from './results_pane';
import mapStore from '../stores/map_store';
import searchQueryStore from '../stores/search_query_store';
import cookie from '../utils/cookie';
import utils from '../utils/utils';
import actions from '../actions/actions';
import config from '../config.js';

var Home = React.createClass({
  displayName: 'Home',

  propTypes: {
    params: React.PropTypes.object,
    query: React.PropTypes.object
  },

  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQueryChanged'),
    Reflux.listenTo(mapStore, 'onMapStoreData')
  ],

  getInitialState: function () {
    return {
      results: [],
      loading: mapStore.footprintsWereFecthed(),
      map: {
        view: null
      },
      selectedSquareQuadkey: null,
      selectedItemId: null,
      filterParams: searchQueryStore.getParameters()
    };
  },

  onMapStoreData: function (what) {
    var state = _.cloneDeep(this.state);
    state.results = mapStore.getResults();
    state.loading = what === 'squareData' ? false : mapStore.footprintsWereFecthed();
    this.setState(state);
  },

  // Action listener
  onSearchQueryChanged: function (params) {
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
      cookie.create('oam-map-view', state.map.view.replace(/,/g, '|'));
    }

    // Selected Square
    if (this.props.params.square !== nextProps.params.square) {
      state.selectedSquareQuadkey = nextProps.params.square;
    }
    // If the square was set and it's not anymore means that the results
    // have been dismissed.
    if (this.props.params.square && !nextProps.params.square) {
      // console.log('componentWillReceiveProps -- results pane was dismissed');
      // Clean the results.
      state.results = [];
    }
    if (this.props.params.square !== nextProps.params.square && nextProps.params.square) {
      // console.log('Home component quadkey changed', nextProps.params.square);
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
      var bbox = utils.tileBboxFromQuadkey(this.state.selectedSquareQuadkey);
      actions.selectedBbox(bbox);
    }
  },

  render: function () {
    var selectedItem = _.find(this.state.results, {_id: this.state.selectedItemId});

    return (
      <div>
        {this.state.loading ? <p className='loading revealed'>Loading</p> : null}

        <MapBoxMap
          query={this.props.query}
          params={this.props.params}
          map={this.state.map}
          selectedSquareQuadkey={this.state.selectedSquareQuadkey}
          selectedItemId={this.state.selectedItemId}
          selectedItem={selectedItem}
          filterParams={this.state.filterParams} />

        <MiniMap
          query={this.props.query}
          selectedSquare={this.props.params.square}
          selectedSquareQuadkey={this.state.selectedSquareQuadkey}
          selectedItemId={this.state.selectedItemId}
          map={this.state.map} />

        <ResultsPane
          query={this.props.query}
          map={this.state.map}
          results={this.state.results}
          selectedItemId={this.state.selectedItemId}
          selectedSquareQuadkey={this.state.selectedSquareQuadkey} />
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
    if (!this.isMapViewValid(mapView)) {
      var cookieView = cookie.read('oam-map-view');
      if (cookieView !== 'undefined' && cookieView !== null) {
        mapView = cookie.read('oam-map-view').replace(/\|/g, ',');
      } else {
        mapView = config.map.initialView.concat(config.map.initialZoom).join(',');
        // Let's correct the cookie value.
        cookie.create('oam-map-view', mapView.replace(/,/g, '|'));
      }
    }
    return mapView;
  },

  // The router path for the map view is defined on the route like `/:mapview`.
  // So we don't have a 404, we can only check if the URL looks like a map view.
  // TODO: Return an actual 404 page.
  isMapViewValid: function (mapView) {
    if (typeof mapView !== 'string') return;
    return mapView.split(',').length === 3;
  }
});

module.exports = Home;
