'use strict';
var qs = require('querystring');
var Reflux = require('reflux');
var _ = require('lodash');
var $ = require('jquery');
var extent = require('turf-extent');
var rbush = require('rbush');
var actions = require('../actions/actions');
var searchQueryStore = require('./search_query_store');
var config = require('../config');

module.exports = Reflux.createStore({
  storage: {
    prevSearchParams: '',
    results: [],
    sqrSelected: null,
    latestImagery: null,
    footprintsTree: null
  },

  // Called on creation.
  // Setup listeners.
  init: function () {
    this.listenTo(actions.selectedBbox, this.onSelectedBbox);
    this.queryLatestImagery();
    this.queryFootprints();
  },

  queryLatestImagery: function () {
    var _this = this;

    $.get(config.catalog.url + '/meta?order_by=acquisition_end&sort=desc&limit=1')
      .success(function (data) {
        _this.storage.latestImagery = data.results[0];
        actions.latestImageryLoaded();
      });
  },

  queryFootprints: function () {
    var _this = this;

    console.time('fetch footprints');
    $.get(config.catalog.url + '/meta?limit=99999')
      .success(function (data) {
        console.timeEnd('fetch footprints');
        var footprintsFeature = _this.parseFootprints(data.results);

        console.time('index footprints');
        var tree = rbush(9);
        tree.load(footprintsFeature.features.map(function (feat) {
          var item = feat.geometry.bbox;
          item.feature = feat;
          return item;
        }));
        console.timeEnd('index footprints');
        // Done.
        _this.storage.footprintsTree = tree;
        _this.trigger('footprints');
      });
  },

  parseFootprints: function (results) {
    var fc = {
      type: 'FeatureCollection',
      features: []
    };
    var id = 0;
    _.each(results, function (foot) {
      fc.features.push({
        type: 'Feature',
        properties: {
          gsd: foot.gsd,
          tms: !!foot.properties.tms,
          acquisition_end: foot.acquisition_end,
          FID: id++
        },
        geometry: foot.geojson
      });
    });
    return fc;
  },

  getFootprintsInSquare: function (sqrFeature) {
    if (!this.storage.footprintsTree) {
      return [];
    }
    return this.storage.footprintsTree.search(extent(sqrFeature));
  },

  footprintsWereFecthed: function () {
    return this.storage.footprintsTree === null;
  },

  /**
   * Translate the application-based search parameters into terms that the
   * API understands, then hit the API and broadcast the result.
   */
  queryData: function () {
    var parameters = searchQueryStore.getParameters();
    var _this = this;
    console.log('mapstore queryData', parameters);

    // hit API and broadcast result
    var resolutionFilter = {
      'all': {},
      'low': {gsd_from: 5}, // 5 +
      'medium': {gsd_from: 1, gsd_to: 5}, // 1 - 5
      'high': {gsd_to: 1} // 1
    }[parameters.resolution];

    var d = new Date();
    if (parameters.date === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (parameters.date === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (parameters.date === 'year') {
      d.setFullYear(d.getFullYear() - 1);
    }

    var dateFilter = parameters.date === 'all' ? {} : {
      acquisition_from: [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
      ].join('-')
    };

    var typeFilter = parameters.dataType === 'all' ? {} : { has_tiled: true };

    // Calculate bbox;
    var bbox = this.storage.selectedBbox.join(',');
    console.log('selected feature bbox', bbox);

    var params = _.assign({
      limit: 4000,
      bbox: bbox
    }, resolutionFilter, dateFilter, typeFilter);

    console.log('search:', params);
    var strParams = qs.stringify(params);
    if (strParams === this.storage.prevSearchParams) {
      console.log('search params did not change. Api call aborted.');
      _this.trigger('squareData');
      return;
    } else {
      console.log('prev params', this.storage.prevSearchParams);
      console.log('curr params', strParams);
    }
    this.storage.prevSearchParams = strParams;

    $.get(config.catalog.url + '/meta?' + strParams)
      .success(function (data) {
        console.log('api catalog results:', data);
        _this.storage.results = data.results;
        _this.trigger('squareData');
      });
  },

  // Actions listener.
  onSelectedBbox: function (bbox) {
    this.storage.selectedBbox = bbox;
    this.queryData();
  },

  /**
   * Returns the latest imagery's coordinates.
   * @return Feature or null
   */
  getLatestImagery: function () {
    return this.storage.latestImagery;
  },

  /**
   * Returns the stored results.
   * @return Array or null
   */
  getResults: function () {
    return this.storage.results;
  }

});
