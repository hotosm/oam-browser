'use strict';
var Reflux = require('reflux');
var actions = require('../actions/actions');

module.exports = Reflux.createStore({

  storage: {
    results: [],
    selectedItem: null
  },

  init: function() {
    this.listenTo(actions.resultsChange, this.onResultsChange);
    this.listenTo(actions.imageSelect, this.onImageSelect);
  },

  // Action listener.
  onResultsChange: function(results) {
    console.log('onResultsChange', Date.now());
    this.storage.results = results;
    this.trigger(this.storage);
  },

  // Action listener.
  onImageSelect: function(data) {
    this.storage.selectedItem = data;
    this.trigger(this.storage);
  }


});