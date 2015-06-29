'use strict';
var Reflux = require('reflux');

module.exports = Reflux.createActions({
  // Map actions.
  'mapMove': {},
  'mapSquareSelected': {},
  'mapSquareUnselected': {},
  'setSearchParameter': {},

  'latestImageryLoaded': {},

  'resultsChange': {},

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
