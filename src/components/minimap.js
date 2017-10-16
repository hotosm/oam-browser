/* global L */

import React from "react";
import PropTypes from "prop-types";

import utils from "utils/utils";
import mapLayers from "utils/map-layers";

import "mapbox.js";

export default class extends React.Component {
  static displayName = "MiniMap";

  static propTypes = {
    params: PropTypes.object
  };

  map = null;
  targetLines = null;

  shouldComponentUpdate(nextProps, _nextState) {
    return nextProps.params.map !== this.props.params.map;
  }

  componentDidUpdate() {
    this.setCrosshair();
  }

  componentDidMount() {
    this.map = L.mapbox
      .map(this.refs.mapContainer, null, {
        center: [0, 0],
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        maxBounds: L.latLngBounds([-90, -180], [90, 180])
      })
      .fitBounds(L.latLngBounds([-90, -180], [90, 180]));

    this.map.addLayer(L.tileLayer(mapLayers[0].url));

    this.targetLines = L.multiPolyline([], {
      clickable: false,
      color: "#1f3b45",
      weight: 0.5
    }).addTo(this.map);

    this.map.on("click", this.onMapClick);

    this.setCrosshair();
    utils.delayedMapContainerResize(this.map);
  }

  render() {
    return (
      // TODO: Styling here is a hack, try upgrading mapbox.js
      <div id="minimap" ref="mapContainer" style={{ position: "fixed" }} />
    );
  }

  // Map event.
  onMapClick = e => {
    var zoom = this.props.params.map.split(",")[2];
    var mapView = utils.getMapViewString(e.latlng.lng, e.latlng.lat, zoom);
    utils.pushURI(this.props, {
      map: mapView
    });
  };

  setCrosshair = () => {
    if (!this.props.params.map) return;
    var mapParts = this.props.params.map.split(",");
    var lat = parseFloat(mapParts[0]);
    var lng = parseFloat(mapParts[1]);
    if (isNaN(lat) || isNaN(lng)) return;
    this.targetLines.setLatLngs([
      [[-90, lat], [90, lat]],
      [[lng, -220], [lng, 220]]
    ]);
  };
}
