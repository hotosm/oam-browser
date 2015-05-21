'use strict';
var Reflux = require('reflux');

module.exports = Reflux.createActions({
  // Map actions.
  'mapMove': {},
  'mapSquareSelected': {},
  'mapSquareUnselected': {},

  'resultsChange': {},

  // Results pane related actions.
  'resultItemView': {},
  'resultListView': {},

  'prevResult' : {},
  'nextResult' : {},

  'resultOver': {},
  'resultOut': {},
});