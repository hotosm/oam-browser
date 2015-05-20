'use strict';
var Reflux = require('reflux');

module.exports = Reflux.createActions({
  // Map actions.
  'mapMove': {},
  'mapSquareSelected': {},
  'mapSquareUnselected': {},

  'resultsChange': {},

  // Results pane related actions.
  'resultOpen': {},
  'resultClose': {},
  'prevResult' : {},
  'nextResult' : {},
});