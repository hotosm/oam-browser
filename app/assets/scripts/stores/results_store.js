'use strict';
var Reflux = require('reflux');
var actions = require('../actions/actions');

module.exports = Reflux.createStore({

  storage: {
    results: [],
    selectedItem: null,
    selectedItemIndex: null,
  },

  init: function() {
    this.listenTo(actions.resultsChange, this.onResultsChange);
    this.listenTo(actions.resultOpen, this.onResultOpen);
    this.listenTo(actions.resultClose, this.onResultClose);
    this.listenTo(actions.nextResult, this.onNextResult);
    this.listenTo(actions.prevResult, this.onPrevResult);
  },

  // Action listener.
  onResultsChange: function(results) {
    console.log('onResultsChange', Date.now());
    this.storage.results = results;
    this.trigger(this.storage);
  },

  // Action listener.
  onResultOpen: function(data) {
    console.log('onImageSelect');
    this.storage.selectedItem = data;
    // Find the object index.
    for (var i in this.storage.results) {
      if (this.storage.results[i]._id == data._id) {
        this.storage.selectedItemIndex = parseInt(i);
        break;
      }
    }
    this.trigger(this.storage);
  },

  // Action listener.
  onResultClose: function() {
    this.storage.selectedItemIndex = null;
    this.storage.selectedItem = null;
    this.trigger(this.storage);
  },

  // Action listener.
  onNextResult: function() {
    this.storage.selectedItemIndex++;
    var i = this.storage.selectedItemIndex;
    this.storage.selectedItem = this.storage.results[i];
    this.trigger(this.storage);
  },

  // Action listener.
  onPrevResult: function() {
    this.storage.selectedItemIndex--;
    var i = this.storage.selectedItemIndex;
    this.storage.selectedItem = this.storage.results[i];
    this.trigger(this.storage);
  },

});