'use strict';
var qs = require('querystring');
var Reflux = require('reflux');
var _ = require('lodash');
var $ = require('jquery');
var turf = require('turf');
var actions = require('../actions/actions');
var searchQueryStore = require('./search_query_store')
var config = require('../config');

module.exports = Reflux.createStore({
  storage: {
    prevSearchParams: '',
    results: [],
    sqrSelected: null,
    latestImagery: null
  },

  // Called on creation.
  // Setup listeners.
  init: function() {
    this.listenTo(actions.selectedBbox, this.onSelectedBbox);
    this.queryLatestImagery();
  },

  queryLatestImagery: function() {
    var _this = this;

    $.get(config.catalog.url + '/meta?limit=1')
      .success(function(data) {
        _this.storage.latestImagery = data.results[0];
        actions.latestImageryLoaded();
      });
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
    }

    var typeFilter = parameters.dataType === 'all' ? {} : { has_tiled: true };

    // Calculate bbox;
    var bbox = this.storage.selectedBbox.join(',');
    console.log('selected feature bbox', bbox);

    var params = _.assign({
      limit: 4000,
      bbox: bbox,
    }, resolutionFilter, dateFilter, typeFilter);

    console.log('search:', params);
    var strParams = qs.stringify(params);
    if (strParams === this.storage.prevSearchParams) {
      console.log('search params did not change. Api call aborted.');
      return;
    }
    else {
      console.log('prev params', this.storage.prevSearchParams);
      console.log('curr params', strParams);
    }
    this.storage.prevSearchParams = strParams;

    $.get(config.catalog.url + '/meta?' + strParams)
      .success(function(data) {
        console.log('api catalog results:', data);
        _this.storage.results = data.results;
        _this.trigger(_this.storage.results);
      });
  },

  // Actions listener.
  onSelectedBbox: function(bbox) {
    this.storage.selectedBbox = bbox;
    this.queryData();
  },

  /**
   * Returns the latest imagery's coordinates.
   * @return Feature or null
   */
  getLatestImagery: function() {
    return this.storage.latestImagery;
  }

});
