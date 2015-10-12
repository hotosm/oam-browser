'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var mapboxgl = require('mapbox-gl');
var _ = require('lodash');
var makeStyle = require('../map_styles/style-minimap');
var utils = require('../utils/utils');

var MiniMap = React.createClass({
  mixins: [
    Router.Navigation,
    Router.State
  ],

  map: null,

  // Lifecycle method.
  shouldComponentUpdate: function(nextProps, nextState) {
   return nextProps.selectedSquare != this.props.selectedSquare;
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    console.log('componentDidMount MiniMap');
    var _this = this;

    this.map = new mapboxgl.Map({
      container: this.getDOMNode(),
      style: makeStyle(),

      attributionControl: false,
      //interactive: false,
      minZoom: 0.1,
      maxZoom: 0.1
    });

    this.map.on('click', this.onMapClick);
    this.map.on('load', this.onMapLoad);
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
    var r = routes[routes.length - 1].name;
    var params = _.cloneDeep(this.getParams());
    var pieces = params.map.split(',');
    params.map = utils.getMapViewString(e.lngLat.lng, e.lngLat.lat, pieces[2]);
    this.transitionTo(r, params, this.getQuery());
  },

  // Map event.
  onMapLoad: function() {
    this.setCrosshair();
  },

  setCrosshair: function() {
    console.log('minimap -- setting crosshair');
    var src = this.map.getSource('crosshair');

    if (!this.props.selectedSquare) {
      src.setData({
        'type': 'FeatureCollection',
        'features': []
      });
    }
    else {
      var c = utils.tileCenterFromQuadkey(this.props.selectedSquare).geometry.coordinates;
      var lineFeature = function(coords) {
        return {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': coords
          }
        }
      };

      src.setData({
        'type': 'FeatureCollection',
        'features': [
          lineFeature([
            [c[0], -90],
            [c[0], 90]
          ]),
          lineFeature([
            [-180, c[1]],
            [180, c[1]]
          ])
        ]
      });

      this.map.setCenter(c);
    }
  }
});

module.exports = MiniMap;