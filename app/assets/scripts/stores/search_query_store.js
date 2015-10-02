var Reflux = require('reflux');
var actions = require('../actions/actions');
var config = require('../config.js');
var _ = require('lodash');

var turf = require('turf');

/**
 * Models the "search parameters" from the point of view of the application.
 * NOT responsible for undersatning the API -- that's done by map_store, which
 * consumes this one.
 */
module.exports = Reflux.createStore({
  _parameters: {
    date: 'all',
    resolution: 'all',
    dataType: 'all'
  },

  init: function () {
    // this.listenTo(actions.mapMove, this.onMapMove);

    this.listenTo(actions.mapSquareSelected, this.onMapSquareSelected);

    this.listenTo(actions.setDateFilter, this.onSetDateFilter);
    this.listenTo(actions.setResolutionFilter, this.onSetResolutionFilter);
    this.listenTo(actions.setDataTypeFilter, this.onSetDataTypeFilter);
  },

    // Actions listener.
  onMapSquareSelected: function(sqrFeature) {
    console.log('onMapSquareSelected');
    console.log(sqrFeature);
    var bbox = turf.extent(sqrFeature).join(',');
    console.log('selected featute bbox', bbox);
    this._setParameter({bbox: bbox});
    // this.storage.sqrSelected = sqrFeature;
    // if (!this.storage.sqrSelected.properties) {
    //   this.storage.sqrSelected.properties = {};
    // }
    // this.storage.sqrSelected.properties.centroid = turf.centroid(sqrFeature).geometry.coordinates;
  },



  // onMapMove: function(map) {
  //   if (map.getZoom() < config.map.interactiveGridZoomLimit) {
  //     this._setParameter({bbox: null});
  //     return;
  //   }

  //   var bbox = map.getBounds().toBBoxString();
  //   // ?bbox=[lon_min],[lat_min],[lon_max],[lat_max]
  //   this._setParameter({bbox: bbox});
  // },

  onSetDateFilter: function(period) {
    this._setParameter({date: period});
  },

  onSetResolutionFilter: function(resolutionLevel) {
    this._setParameter({resolution: resolutionLevel});
  },

  onSetDataTypeFilter: function(type) {
    this._setParameter({dataType: type});
  },

  _setParameter: function(params) {
    // update stored search params
    _.assign(this._parameters, params);
    for (var key in this._parameters) {
      if (this._parameters[key] === null) {
        delete this._parameters[key];
      }
    }

    this.trigger(this._parameters, Object.keys(params)[0]);
  }
})
