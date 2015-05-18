'use strict';
require('mapbox.js');
var React = require('react');
var Reflux = require('reflux');
var actions = require('../actions/actions');
var mapStore = require('../stores/map_store');

L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';

module.exports = React.createClass({
  mixins: [Reflux.listenTo(mapStore,"onMapData")],

  map: null,
  polysLayer: null,

  onMapData: function(data) {
    this.setState({
      mapData: data
    });
  },

  componentDidMount: function() {
    console.log('componentDidMount MapBoxMap');
    this.map = L.mapbox.map(this.getDOMNode(), 'mapbox.light', {
      zoomControl: false,
      minZoom : 3,
      maxZoom : 18,
      maxBounds: L.latLngBounds([-90, -180], [90, 180])
    }).setView([40.75, -73.9], 11);

    this.map.on('moveend', function() {
      actions.mapMove(this.map);
    }.bind(this));
  },

  componentDidUpdate: function(/*prevProps, prevState*/) {
    console.log(this.state.mapData);

    if (this.map.hasLayer(this.polysLayer)) {
      this.map.removeLayer(this.polysLayer);
    }

    var polys = {
      'type': 'FeatureCollection',
      'features': []
    };

    this.state.mapData.forEach(function(o) {
      var f = {
        type: 'Feature',
        geometry: {
          type: "Polygon",
          coordinates: o.geojson.coordinates
        },
        properties: {
          fill: '#3887be',
          fillOpacity: 0.2
        }
      };

      polys.features.push(f);
    });

    this.polysLayer = L.geoJson(polys)
    this.map.addLayer(this.polysLayer);

  },

  render: function() {
    return (
      <div id="map"></div>
    );
  }
});