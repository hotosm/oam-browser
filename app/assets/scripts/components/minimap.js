/* global L */
'use strict';
require('mapbox.js');

import { hashHistory } from 'react-router';
import React from 'react';

import utils from '../utils/utils';
import mapLayers from '../utils/map-layers';

var MiniMap = React.createClass({
  displayName: 'MiniMap',

  propTypes: {
    query: React.PropTypes.object,
    mapView: React.PropTypes.string,
    selectedSquare: React.PropTypes.string,
    selectedSquareQuadkey: React.PropTypes.string,
    selectedItemId: React.PropTypes.string
  },

  map: null,

  targetLines: null,

  // Lifecycle method.
  shouldComponentUpdate: function (nextProps, nextState) {
    return nextProps.selectedSquare !== this.props.selectedSquare;
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function () {
    // console.log('componentDidMount MiniMap');

    this.map = L.mapbox.map(this.refs.mapContainer, null, {
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

    this.map.addLayer(L.tileLayer(mapLayers[0].url));

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
  componentDidUpdate: function (/* prevProps, prevState */) {
    this.setCrosshair();
  },

  render: function () {
    return (<div id='minimap' ref='mapContainer'></div>);
  },

  // Map event.
  onMapClick: function (e) {
    var zoom = this.props.mapView.split(',')[2];
    var path = utils.getMapViewString(e.latlng.lng, e.latlng.lat, zoom);
    if (this.props.selectedSquareQuadkey) {
      path += `/${this.props.selectedSquareQuadkey}`;
    }
    if (this.props.selectedItemId) {
      path += `/${this.props.selectedItemId}`;
    }

    hashHistory.push({pathname: path, query: this.props.query});
  },

  setCrosshair: function () {
    if (this.props.selectedSquare) {
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
    } else {
      this.targetLines.clearLayers();
    }
  }
});

module.exports = MiniMap;
