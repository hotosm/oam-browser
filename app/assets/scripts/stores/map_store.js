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
    var bbox = map.getBounds();
    // ?bbox=[lon_min],[lat_min],[lon_max],[lat_max]
    var nw = bbox.getNorthWest();
    var se = bbox.getSouthEast();
    var bbox = nw.lng + ',' + nw.lat + ',' + se.lng + ',' + se.lat;
    $.get('http://oam-catalog.herokuapp.com/meta?bbox=' + bbox)
      .success(function(data) {
        _this.data = data.results;
        _this.trigger(_this.data);
      });
  }

});