'use strict';
var Reflux = require('reflux');
var $ = require('jquery');
var actions = require('../actions/actions');

module.exports = Reflux.createStore({

  data : [],

  init: function() {
    this.listenTo(actions.mapMove, this.onMapMove);
  },

  onMapMove: function(map) {
    var _this = this;

    if (map.getZoom() < 6) {
      this.trigger([]);
      return;
    }

    var bbox = map.getBounds().toBBoxString();
    // ?bbox=[lon_min],[lat_min],[lon_max],[lat_max]
    $.get('http://oam-catalog.herokuapp.com/meta?limit=400&bbox=' + bbox)
      .success(function(data) {
        _this.data = data.results;
        _this.trigger(_this.data);
      });
  }

});