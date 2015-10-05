'use strict';
var Reflux = require('reflux');
var actions = require('../actions/actions');
var mapStore = require('./map_store');

module.exports = Reflux.createStore({

  storage: {
    results: []
  },

  init: function() {
    this.listenTo(mapStore, this.onResultsChange);
  },

  // Action listener.
  onResultsChange: function(results) {
    console.log('onResultsChange');
    this.storage.results = results;
    // this.storage.selectedItem = null;
    // this.storage.selectedItemIndex = null;
    this.trigger(this.storage);
  },
});
