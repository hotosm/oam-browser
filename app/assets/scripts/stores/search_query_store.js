var Reflux = require('reflux');
var actions = require('../actions/actions');
var config = require('../config.js');
var _ = require('lodash');

/**
 * Models the "search parameters" from the point of view of the application.
 * NOT responsible for undersatning the API -- that's done by map_store, which
 * consumes this one.
 */
module.exports = Reflux.createStore({
  _parameters: {
    date: 'all',
    resolution: 'all'
  },

  init: function () {
    this.listenTo(actions.mapMove, this.onMapMove);
    this.listenTo(actions.setDateFilter, this.onSetDateFilter);
    this.listenTo(actions.setResolutionFilter, this.onSetResolutionFilter);
  },

  onMapMove: function(map) {
    if (map.getZoom() < config.map.interactiveGridZoomLimit) {
      this._setParameter({bbox: null});
      return;
    }

    var bbox = map.getBounds().toBBoxString();
    // ?bbox=[lon_min],[lat_min],[lon_max],[lat_max]
    this._setParameter({bbox: bbox});
  },

  onSetDateFilter: function(period) {
    this._setParameter({date: period});
  },

  onSetResolutionFilter: function(resolutionLevel) {
    this._setParameter({resolution: resolutionLevel});
  },

  _setParameter: function(params) {
    // update stored search params
    _.assign(this._parameters, params);
    for (var key in this._parameters) {
      if (this._parameters[key] === null) {
        delete this._parameters[key];
      }
    }

    this.trigger(this._parameters)
  }
})
