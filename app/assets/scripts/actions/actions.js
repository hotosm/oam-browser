'use strict';
var Reflux = require('reflux');

module.exports = Reflux.createActions({
  // Map actions.
  'mapMove': {},
  'mapSquareSelected': {},
  'mapSquareUnselected': {},

  'latestImageryLoaded': {},

  'resultsChange': {},

  // Filter actios
  'setDateFilter': {
    shouldEmit: function (val) {
      return [ 'all', 'week', 'month', 'year' ].indexOf(val) >= 0;
    }
  },
  'setResolutionFilter': {
    shouldEmit: function (val) {
      return [ 'all', 'low', 'medium', 'high' ].indexOf(val) >= 0;
    }
  },
  'setDataTypeFilter': {
    shouldEmit: function (val) {
      return [ 'all', 'service' ].indexOf(val) >= 0;
    }
  },

  // Results pane related actions.
  'resultItemSelect': {},
  'resultItemView': {},
  'resultListView': {},
  'prevResult' : {},
  'nextResult' : {},
  'resultOver': {},
  'resultOut': {},
  
  // openModal(which)
  'openModal': {},

  // Go to the latest imagery.
  // Its coordinates are stored in the mapStore and can be got with
  // getLatestImagery().
  'goToLatest': {},

  'geocoderResult': {},


  'miniMapClick': {},
});
