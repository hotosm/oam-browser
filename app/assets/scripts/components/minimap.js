'use strict';

require('mapbox.js');
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var _ = require('lodash');
var utils = require('../utils/utils');
var config = require('../config.js');

var MiniMap = React.createClass({
  mixins: [
    Router.Navigation,
    Router.State
  ],

  map: null,

  targetLines: null,

  // Lifecycle method.
  shouldComponentUpdate: function(nextProps, nextState) {
   return nextProps.selectedSquare != this.props.selectedSquare;
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

    this.targetLines = L.multiPolyline([], {
      clickable: false,
      color: '#1f3b45',
      weight: 0.5
    }).addTo(this.map);

    this.map.on('click', this.onMapClick);

    this.setCrosshair();
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(/*prevProps, prevState*/) {
    this.setCrosshair();
  },

  render: function() {
    return (<div id="minimap"></div>);
  },

  // Map event.
  onMapClick: function(e) {
    var routes = this.getRoutes();
    var r = routes[routes.length - 1].name || 'map';
    var params = _.cloneDeep(this.getParams());
    var zoom = this.props.mapView.split(',')[2];
    params.map = utils.getMapViewString(e.latlng.lng, e.latlng.lat, zoom);
    this.transitionTo(r, params, this.getQuery());
  },

  setCrosshair: function() {
    if (this.props.selectedSquare) {
      console.log('minimap -- setting crosshair');
      var center = utils.tileCenterFromQuadkey(this.props.selectedSquare).geometry.coordinates;
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
    }
    else {
      console.log('minimap -- unsetting crosshair');
      this.targetLines.clearLayers();
    }
  }
});

module.exports = MiniMap;