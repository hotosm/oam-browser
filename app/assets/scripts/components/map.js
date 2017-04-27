/* global L */
'use strict';
require('mapbox.js');

import { hashHistory } from 'react-router';
import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import $ from 'jquery';
import tilebelt from 'tilebelt';
import centroid from 'turf-centroid';
import inside from 'turf-inside';
import overlaps from 'turf-overlaps';

import actions from '../actions/actions';
import config from '../config.js';
import utils from '../utils/utils';
import mapStore from '../stores/map_store';
import DSZoom from '../utils/ds_zoom';

L.mapbox.accessToken = config.map.mapbox.accessToken;

var Map = React.createClass({
  displayName: 'Map',

  propTypes: {
    query: React.PropTypes.object,
    map: React.PropTypes.object,
    selectedSquareQuadkey: React.PropTypes.string,
    selectedItemId: React.PropTypes.string,
    selectedItem: React.PropTypes.object,
    filterParams: React.PropTypes.object
  },

  mixins: [
    Reflux.listenTo(actions.resultOver, 'onResultOver'),
    Reflux.listenTo(actions.resultOut, 'onResultOut'),
    Reflux.listenTo(actions.resultSelected, 'onResultSelected'),
    Reflux.listenTo(actions.selectPreview, 'onSelectPreview'),
    Reflux.listenTo(actions.fitToBounds, 'onFitToBounds'),
    Reflux.listenTo(actions.moveToCoords, 'onMoveToCoords'),
    Reflux.listenTo(actions.requestMyLocation, 'onRequestMyLocation'),
    Reflux.listenTo(actions.setBaseLayer, 'onChangeBaseLayer')
  ],

  map: null,

  mapGridLayer: null,
  mapSelectedSquareLayer: null,
  mapOverFootprintLayer: null,
  mapOverImageLayer: null,

  // Checked when the component gets updated allows us to know if the map
  // view changed. With that information we know when to perform certain actions
  // like updating the grid.
  requireMapViewUpdate: true,
  // Allow us to know if the image has changed and needs to be updated.
  requireSelectedItemUpdate: true,
  // Control if the selected square is present or not.
  disableSelectedSquare: false,

  // Current active base layer.
  baseLayer: null,

  onSelectPreview: function (what) {
    this.updateSelectedItemImageFootprint(what);
  },

  componentWillReceiveProps: function (nextProps) {
    this.requireMapViewUpdate = this.props.map.view !== nextProps.map.view;
    this.requireSelectedItemUpdate =
      _.get(this.props.selectedItem, '_id', null) !==
      _.get(nextProps.selectedItem, '_id', null);
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function () {
    this.map = L.mapbox.map(this.refs.mapContainer, null, {
      zoomControl: false,
      minZoom: config.map.minZoom,
      maxZoom: config.map.maxZoom,
      maxBounds: L.latLngBounds([-90, -210], [90, 210]),
      attributionControl: false
    });

    this.baseLayer = L.tileLayer(mapStore.getBaseLayer().url);
    this.map.addLayer(this.baseLayer);

    this.refs.mapContainer.classList.add(
      `base-layer--${mapStore.getBaseLayer().id}`
    );

    // Edits the attribution to create link out to github issues
    var credits = L.control.attribution().addTo(this.map);
    credits.addAttribution(
      '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © ' +
      '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | ' +
      '<a href="#" data-hook="map:issue">Report an issue with this map</a>'
    );

    let mapIssueTrigger = this.refs.mapContainer.querySelector(
      '[data-hook="map:issue"]'
    );
    mapIssueTrigger.addEventListener('click', this.onMapIssueReport);

    // Custom zoom control.
    var zoomCtrl = new DSZoom({
      position: 'bottomleft',
      containerClasses: 'zoom-controls',
      zoomInClasses: 'button-zoom button-zoom--in',
      zoomOutClasses: 'button-zoom button-zoom--out'
    });
    this.map.addControl(zoomCtrl);

    this.mapGridLayer = L.geoJson(null, {
      style: L.mapbox.simplestyle.style
    }).addTo(this.map);
    // Footprint layer.
    this.mapOverFootprintLayer = L.geoJson(null, {
      style: L.mapbox.simplestyle.style
    }).addTo(this.map);
    this.mapSelectedSquareLayer = L.geoJson(null).addTo(this.map);

    this.mapGridLayer.on('mouseover', this.onGridSqrOver);
    this.mapGridLayer.on('mouseout', this.onGridSqrOut);
    this.mapGridLayer.on('click', this.onGridSqrClick);

    // Map position from path.
    var mapString = this.stringToMapView(this.props.map.view);
    var view = [mapString.lat, mapString.lng];
    var zoom = mapString.zoom;
    this.map.setView(view, zoom);

    this.map.on('moveend', this.onMapMoveend);

    this.updateGrid();
    this.updateSelectedSquare();
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function (prevProps, prevState) {
    // Is there a need to update the map view.
    if (this.requireMapViewUpdate) {
      var routerMap = this.stringToMapView(this.props.map.view);
      this.map.setView([routerMap.lat, routerMap.lng], routerMap.zoom);
    }
    this.updateGrid();
    this.updateSelectedSquare();

    if (this.requireSelectedItemUpdate) {
      this.updateSelectedItemImageFootprint({ type: 'thumbnail' });
    }
  },

  componentWillUnmount: function () {
    let mapIssueTrigger = this.refs.mapContainer.querySelector(
      '[data-hook="map:issue"]'
    );
    mapIssueTrigger.removeEventListener('click', this.onMapIssueReport);
  },

  // Lifecycle method.
  render: function () {
    return (
      <div>
        <div id='map' ref='mapContainer' />
      </div>
    );
  },

  onMapIssueReport: function (e) {
    e.preventDefault();
    actions.openModal('feedback');
  },

  // Map event
  onMapMoveend: function (e) {
    var path = this.mapViewToString();
    if (this.props.selectedSquareQuadkey) {
      path += `/${this.props.selectedSquareQuadkey}`;
    }
    if (this.props.selectedItemId) {
      path += `/${this.props.selectedItemId}`;
    }

    hashHistory.replace({ pathname: path, query: this.props.query });
  },

  // Map event
  onGridSqrOver: function (e) {
    // On mouseover add gs-highlight.
    if (!this.getSqrQuadKey() && e.layer.feature.properties.count > 0) {
      L.DomUtil.addClass(e.layer._path, 'gs-highlight');
      // Open popup on square center.
      var sqrCenter = centroid(e.layer.feature).geometry.coordinates;
      e.layer.openPopup([sqrCenter[1], sqrCenter[0]]);
    }
  },

  // Map event
  onGridSqrOut: function (e) {
    // On mouseover remove gs-highlight.
    L.DomUtil.removeClass(e.layer._path, 'gs-highlight');
    e.layer.closePopup();
  },

  // Map event
  onGridSqrClick: function (e) {
    // console.log('onGridSqrClick', e);
    // Ensure that the popup doesn't open.
    e.layer.closePopup();

    if (this.props.selectedSquareQuadkey) {
      // There is a square selected. Unselect.
      hashHistory.push({
        pathname: `/${this.props.map.iew}`,
        query: this.props.query
      });
    } else if (e.layer.feature.properties.count) {
      // console.log('onGridSqrClick', 'No square selected. SELECTING');
      var quadKey = e.layer.feature.properties._quadKey;
      var z = Math.round(this.map.getZoom());
      var squareCenter = centroid(e.layer.feature).geometry.coordinates;
      var mapView = utils.getMapViewString(squareCenter[0], squareCenter[1], z);
      hashHistory.push({
        pathname: `/${mapView}/${quadKey}`,
        query: this.props.query
      });
    }
  },

  // Actions listener.
  onFitToBounds: function (bounds) {
    if (bounds) {
      this.map.fitBounds(bounds);
      this.onMapMoveend();
    }
  },

  // Actions listener.
  onMoveToCoords: function (coords) {
    const center = [coords[1], coords[0]];
    const zoom = 16;
    this.map.setView(center, zoom);
    this.onMapMoveend();
  },

  // Actions listener.
  onChangeBaseLayer: function () {
    let layer = mapStore.getBaseLayer();
    this.refs.mapContainer.className = this.refs.mapContainer.className.replace(
      /\bbase-layer--\S*/,
      ''
    );
    this.refs.mapContainer.classList.add(`base-layer--${layer.id}`);
    if (this.baseLayer) {
      this.map.removeLayer(this.baseLayer);
    }
    this.baseLayer = L.tileLayer(layer.url);
    this.map.addLayer(this.baseLayer);
  },

  // Actions listener.
  onRequestMyLocation: function () {
    navigator.geolocation.getCurrentPosition(
      position => {
        let { longitude, latitude } = position.coords;
        let mapView = utils.getMapViewString(longitude, latitude, 15);
        hashHistory.push({ pathname: `/${mapView}`, query: this.props.query });
      },
      err => {
        console.warn('my location error', err);
      }
    );
  },

  // Action listener for when mouse enters a result in the results modal
  onResultOver: function (feature) {
    var f = utils.getPolygonFeature(feature.geojson.coordinates);
    this.mapOverFootprintLayer.clearLayers().addData(f);
    this.mapOverFootprintLayer.eachLayer(function (l) {
      L.DomUtil.addClass(l._path, 'g-footprint');
    });
  },

  // Action listener for when the mouse leaves a result in the results modal
  onResultOut: function () {
    this.mapOverFootprintLayer.clearLayers();
  },

  // Action listener for when a result in the results modal is clicked
  onResultSelected: function (result) {
    this.onResultOut();
    let { map, selectedSquareQuadkey } = result;
    let path = `${map.view}/${selectedSquareQuadkey}/${result.data._id}`;
    hashHistory.push({ pathname: path, query: result.query });
  },

  updateGrid: function () {
    var _this = this;
    this.mapGridLayer.clearLayers();

    // Recompute grid based on current map view (bounds + zoom).
    var bounds = this.map.getBounds().toBBoxString().split(',').map(Number);
    var gridData = this.computeGrid(this.map.getZoom(), bounds);

    // Stick a 'count' property onto each grid square, based on the number of
    // footprints that intersect with the square.
    // console.time('aggregate on grid');
    gridData.features.forEach(function (gridSquare) {
      var featureCenter = centroid(gridSquare);
      // The footprints with bboxes that intersect with this grid square.
      // Get all the footprints inside the current square.
      var foots = mapStore.getFootprintsInSquare(gridSquare);
      // Filter with whatever filters are set.
      foots = foots
        .filter(function (foot) {
          var filter = _this.props.filterParams;
          var prop = foot.feature.properties;

          // Data type.
          if (filter.dataType !== 'all' && !prop.tms) {
            return false;
          }

          // Resolution.
          switch (filter.resolution) {
            // >=5
            case 'low':
              if (prop.gsd < 5) {
                return false;
              }
              break;
            // <5 && >=1
            case 'medium':
              if (prop.gsd >= 5 || prop.gsd < 1) {
                return false;
              }
              break;
            // < 1
            case 'high':
              if (prop.gsd >= 1) {
                return false;
              }
              break;
          }

          // Date.
          if (filter.date !== 'all') {
            var d = new Date();
            if (filter.date === 'week') {
              d.setDate(d.getDate() - 7);
            } else if (filter.date === 'month') {
              d.setMonth(d.getMonth() - 1);
            } else if (filter.date === 'year') {
              d.setFullYear(d.getFullYear() - 1);
            }

            if (new Date(prop.acquisition_end).getTime() < d.getTime()) {
              return false;
            }
          }

          return true;
        })
        // Filter to ensure that the footprint is really inside the square
        // an not just its bounding box.
        .filter(function (foot) {
          var footprint = foot.feature;
          var footprintCenter = centroid(footprint);
          return (
            inside(featureCenter, footprint) ||
            inside(footprintCenter, gridSquare) ||
            overlaps(footprint, gridSquare)
          );
        });
      gridSquare.properties.count = foots.length;
    });

    // Color the grid accordingly.
    this.mapGridLayer.addData(gridData);
    this.mapGridLayer.eachLayer(function (l) {
      var elClasses = ['gs'];

      // Is there a square selected?
      // When there is a square selected, gs-inactive to everything.
      if (_this.getSqrQuadKey()) {
        elClasses.push('gs-inactive');
      } else {
        // Gradation.
        if (l.feature.properties.count >= 50) {
          elClasses.push('gs-density-high');
        } else if (l.feature.properties.count >= 20) {
          elClasses.push('gs-density-medhigh');
        } else if (l.feature.properties.count >= 5) {
          elClasses.push('gs-density-med');
        } else if (l.feature.properties.count > 0) {
          elClasses.push('gs-density-low');
        }
      }

      // Add all classes.
      L.DomUtil.addClass(l._path, elClasses.join(' '));

      var p = L.popup({
        autoPan: false,
        closeButton: false,
        offset: L.point(0, 10),
        className: 'gs-tooltip-count'
      }).setContent(l.feature.properties.count.toString());

      l.bindPopup(p);
    });

    // console.groupEnd('updateGrid');
  },

  updateSelectedSquare: function () {
    // Clear the selected square layer.
    this.mapSelectedSquareLayer.clearLayers();
    // If there is a selected square add it to its own layer.
    // In this way we can scale the grid without touching the selected square.
    if (this.getSqrQuadKey() && !this.disableSelectedSquare) {
      var qk = this.getSqrQuadKey();
      var coords = utils.coordsFromQuadkey(qk);
      var f = utils.getPolygonFeature(coords);

      this.mapSelectedSquareLayer.addData(f).eachLayer(function (l) {
        L.DomUtil.addClass(l._path, 'gs-active gs');
      });
    }
  },

  // When zoomed in to a layer that accepts high zoom levels and that
  // layer is removed, we need to zoom back out to the default max
  // zoom, but still remain centred on the same coord.
  correctOverZoom: function () {
    this.map.options.maxZoom = config.map.maxZoom;
    if (this.map.getZoom() > config.map.maxZoom) {
      this.map.setZoom(config.map.maxZoom);
      this.onMapMoveend();
    }
  },

  updateSelectedItemImageFootprint: function (previewOptions) {
    this.disableSelectedSquare = false;
    if (this.map.hasLayer(this.mapOverImageLayer)) {
      this.map.removeLayer(this.mapOverImageLayer);
      this.mapOverImageLayer = null;
      this.correctOverZoom();
    }
    if (this.props.selectedItem) {
      var item = this.props.selectedItem;
      if (previewOptions.type === 'tms') {
        // We can preview the main tms and the custom ones as well.
        // When previewing the main tms the index property won't be set.
        // We're not doing any validation here because the action call is
        // controlled.
        let tmsUrl = previewOptions.index === undefined
          ? item.properties.tms
          : item.custom_tms[previewOptions.index];
        tmsUrl = tmsUrl.replace('{zoom}', '{z}');

        this.disableSelectedSquare = true;
        const layerMaxZoom = this.getLayerMaxZoom(item.properties.tms);
        this.map.options.maxZoom = layerMaxZoom;
        this.mapOverImageLayer = L.tileLayer(tmsUrl, { maxZoom: layerMaxZoom });
      } else if (previewOptions.type === 'thumbnail') {
        var imageBounds = [
          [item.bbox[1], item.bbox[0]],
          [item.bbox[3], item.bbox[2]]
        ];
        this.mapOverImageLayer = L.imageOverlay(
          item.properties.thumbnail,
          imageBounds
        );
      }
      this.mapOverImageLayer && this.map.addLayer(this.mapOverImageLayer);
    }
    this.updateSelectedSquare();
  },

  // Mapbox.js doesn't seem to account for the new zoom levels when adding a layer.
  // So we need to fetch the tilejSON data over HTTP, parse it for the max zoom,
  // then apply it both to the map to adjust the zoom controls and the layer to make
  // it trigger the relevant HTTP tiling requests for zoom levels above the default
  // 18.
  // TODO: Add layer's tileJSON, or relevant portions thereof, to oin-meta-generator.
  //       This will prevent the need for;
  //       1. Hacking the `tms` field to get the base tileJSON URI.
  //       2. Making a blocking synchronous XHR call.
  getLayerMaxZoom: function (tmsURI) {
    const tileJSONURI = tmsURI
      .replace(/\/\{z\}\/\{x\}\/\{y\}.*/, '')
      .replace('http://', 'https://');
    let maxZoom;
    $.get({url: tileJSONURI, async: false}).success((data) => {
      maxZoom = data.maxzoom;
    });
    return maxZoom;
  },

  // Helper functions

  getSqrQuadKey: function () {
    return this.props.selectedSquareQuadkey;
  },

  /**
   * Build a grid for the given zoom level, within the given bbox
   *
   * @param {number} zoom
   * @param {Array} bounds [minx, miny, maxx, maxy]
   */
  computeGrid: function (zoom, bounds) {
    // We'll use tilebelt to make pseudo-tiles at a zoom three levels higher
    // than the given zoom. This means that for each actual map tile, there will
    // be 4^3 = 64 grid squares.
    zoom += 2;
    var ll = tilebelt.pointToTile(bounds[0], bounds[1], zoom);
    var ur = tilebelt.pointToTile(bounds[2], bounds[3], zoom);

    var boxes = [];
    for (var x = ll[0]; x <= ur[0]; x++) {
      for (var y = ll[1]; y >= ur[1]; y--) {
        var tile = [x, y, zoom];
        var feature = {
          type: 'Feature',
          properties: {
            _quadKey: tilebelt.tileToQuadkey(tile),
            id: boxes.length,
            tile: tile.join('/')
          },
          geometry: tilebelt.tileToGeoJSON(tile)
        };
        boxes.push(feature);
      }
    }
    return {
      type: 'FeatureCollection',
      features: boxes
    };
  },

  /**
   * Converts the map view (coords + zoom) to use on the path.
   *
   * @return string
   */
  mapViewToString: function () {
    var center = this.map.getCenter();
    var zoom = Math.round(this.map.getZoom());
    return utils.getMapViewString(center.lng, center.lat, zoom);
  },

  /**
   * Converts a path string like 60.359564131824214,4.010009765624999,6
   * to a readable object
   *
   * @param  String
   *   string to convert
   * @return object
   */
  stringToMapView: function (string) {
    var data = string.split(',');
    return {
      lng: data[0],
      lat: data[1],
      zoom: data[2]
    };
  }
});

module.exports = Map;
