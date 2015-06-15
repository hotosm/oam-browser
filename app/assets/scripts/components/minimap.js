'use strict';
require('mapbox.js');
var React = require('react/addons');
var Reflux = require('reflux');
// Not working. Using cdn. (turf.intersect was throwing a weird error)
//var turf = require('turf');
var actions = require('../actions/actions');
var mapStore = require('../stores/map_store');
var config = require('../config.js');

var MiniMap = React.createClass({
  mixins: [
    Reflux.listenTo(actions.mapMove, "onMapMove"),
    Reflux.listenTo(actions.mapSquareSelected, "onMapSquareSelected"),
    Reflux.listenTo(actions.mapSquareUnselected, "onMapSquareUnselected")
  ],

  map: null,

  viewfinder: null,
  targetLines: null,

  // Actions listener.
  onMapMove: function(mainmap) {
    var b = mainmap.getBounds();

    this.viewfinder.setLatLngs([
      b.getNorthEast(),
      b.getNorthWest(),
      b.getSouthWest(),
      b.getSouthEast()
    ]).addTo(this.map);
  },

  onMapSquareSelected: function(sqrFeature) {
    var center = sqrFeature.properties.centroid;

    this.targetLines.setLatLngs([
      [
        [-90, center[0]],
        [90, center[0]]
      ],
      [
        [center[1], -220],
        [center[1], 220]
      ]
    ]);
  },

  onMapSquareUnselected: function() {
    this.targetLines.clearLayers();
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    console.log('componentDidMount MiniMap');
    var _this = this;

    this.map = L.mapbox.map(this.getDOMNode(), config.map.baseLayer, {
      center: [0, 0],

      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,

      maxBounds: L.latLngBounds([-90, -180], [90, 180])
    }).fitBounds(L.latLngBounds([-90, -180], [90, 180]));

    this.viewfinder = L.polygon([], {
      clickable: false,
      color: '#439ab4',
      weight: 2
    }).addTo(this.map);


    this.targetLines = L.multiPolyline([], {
      clickable: false,
      color: '#439ab4',
      weight: 2
    }).addTo(this.map);

    console.log(this.targetLines);
    this.map.on('click', function(e) {
      actions.miniMapClick(e.latlng);
    });
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(/*prevProps, prevState*/) {
    console.log('componentDidUpdate');
  },

  render: function() {
    return (<div id="minimap"></div>);
  },

});

module.exports = MiniMap;