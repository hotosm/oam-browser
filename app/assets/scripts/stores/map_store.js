'use strict';
var qs = require('querystring');
var Reflux = require('reflux');
var _ = require('lodash');
var $ = require('jquery');
var actions = require('../actions/actions');
var overlaps = require('turf-overlaps');
var utils = require('../utils/utils');
var config = require('../config.js');

module.exports = Reflux.createStore({

  storage: {
    searchParameters: { limit: 4000 },
    results: [],
    sqrSelected: null,
    latestImagery: null
  },

  // Called on creation.
  // Setup listeners.
  init: function() {
    this.listenTo(actions.mapMove, this.onMapMove);
    this.listenTo(actions.mapSquareSelected, this.onMapSquareSelected);
    this.listenTo(actions.mapSquareUnselected, this.onMapSquareUnselected);
    this.listenTo(actions.setSearchParameter, this.onSetSearchParameter);

    this.queryLatestImagery();
  },

  queryLatestImagery: function() {
    var _this = this;

    $.get('http://oam-catalog.herokuapp.com/meta?limit=1')
      .success(function(data) {
        _this.storage.latestImagery = data.results[0].geojson;
        actions.latestImageryLoaded();
      });
  },

  // Actions listener.
  onMapMove: function(map) {
    if (map.getZoom() < config.map.interactiveGridZoomLimit) {
      this.trigger([]);
      return;
    }

    var bbox = map.getBounds().toBBoxString();
    // ?bbox=[lon_min],[lat_min],[lon_max],[lat_max]
    this.onSetSearchParameter({bbox: bbox});
  },

  /**
   * Update the current search parameters with the key-value pairs in the
   * given `params` object. In keeping with React's setState style, this is
   * an *additive* change, except that any existing search parameter whose
   * value in `params` is `null` is removed.
   *
   * After the paramters are update, hit the API and broadcast results.
   */
  onSetSearchParameter: function(params) {
    var _this = this;

    // update stored search params
    _.assign(this.storage.searchParameters, params);
    for (key in this.storage.params) {
      if (this.storage.params[key] === null) {
        delete this.storage.params[key];
      }
    }

    // hit API and broadcast result
    if (this.storage.searchParameters.bbox) {
      var params = qs.stringify(this.storage.searchParameters);
      $.get('http://oam-catalog.herokuapp.com/meta?' + params)
        .success(function(data) {
          _this.storage.results = data.results;
          _this.trigger(_this.storage.results);
        });
    }
  },

  // Actions listener.
  onMapSquareSelected: function(sqrFeature) {
    console.log('onMapSquareSelected');
    this.storage.sqrSelected = sqrFeature;
    if (!this.storage.sqrSelected.properties) {
      this.storage.sqrSelected.properties = {};
    }
    this.storage.sqrSelected.properties.centroid = turf.centroid(sqrFeature).geometry.coordinates;
  },

  // Actions listener.
  onMapSquareUnselected: function() {
    this.storage.sqrSelected = null;
  },

  /**
   * Returns whether there's a map square selected.
   * @return {Boolean}
   */
  isSelectedSquare: function() {
    return this.storage.sqrSelected !== null;
  },

  /**
   * Returns the selected square feature.
   * @return Feature or null
   */
  getSelectedSquare: function() {
    return this.storage.sqrSelected;
  },

  /**
   * Returns the selected square centroid.
   * @return Array or null
   */
  getSelectedSquareCenter: function() {
    return this.storage.sqrSelected !== null ? this.storage.sqrSelected.properties.centroid : null;
  },

  /**
   * Returns the latest imagery's coordinates.
   * @return Feature or null
   */
  getLatestImagery: function() {
    return this.storage.latestImagery;
  },

  /**
   * Calls iterator(result) for each result that intersects the given feature.
   * 
   * @param  feature
   *   The feature with which to check the intersection.
   * @param  iterator function(result)
   *   The function called for each result that intersects the feature
   */
  forEachResultIntersecting: function(feature, iterator) {
    // Centroid of the feature.
    // Why this is needed:
    // To check whether a footprint intersects a square, turf-overlap is
    // being used. (turf intersect computes the intersection and is too slow)
    // However turf-overlap returns false if the square is fully inside
    // the footprint. Don't know if this is the desired behavior?
    // To solve this we check if the square's centroid is inside the footprint.
    var featureCenter = turf.centroid(feature);

    this.storage.results.forEach(function(o) {
      var footprint = utils.getPolygonFeature(o.geojson.coordinates);
      var footprintCenter = turf.centroid(footprint);
      if (turf.inside(featureCenter, footprint) || turf.inside(footprintCenter, feature) || overlaps(footprint, feature)) {
        iterator(o);
      }
    });
  },

  /**
   * Returns the results that intersect with the given feature.
   * 
   * @param  feature
   *  The feature with which to check the intersection.
   *  
   * @return Array
   *   Intersecting results
   */
  getResultsIntersect: function(feature) {
    var intersected = [];

    this.forEachResultIntersecting(feature, function(result) {
      intersected.push(result);
    });
    
    return intersected;
  },

});
