'use strict';
require('mapbox.js');

var centroid = require('turf-centroid')
var inside = require('turf-inside')
var overlaps = require('turf-overlaps')
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var _ = require('lodash');
var tilebelt = require('tilebelt');
var actions = require('../actions/actions');
var config = require('../config.js');
var utils = require('../utils/utils');
var dsZoom = require('../utils/ds_zoom');
var mapStore = require('../stores/map_store');

L.mapbox.accessToken = config.map.mapbox.accessToken;

var Map = React.createClass({
  mixins: [
    Reflux.listenTo(actions.resultOver, "onResultOver"),
    Reflux.listenTo(actions.resultOut, "onResultOut"),

    Reflux.listenTo(actions.geocoderResult, "onGeocoderResult"),

    Router.Navigation,
    Router.State
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

  // Lifecycle method.
  componentWillReceiveProps: function(nextProps) {
    console.groupCollapsed('componentWillReceiveProps');

    console.log('previous map view --', this.props.params.map);
    console.log('new map view --', nextProps.params.map);
    this.requireMapViewUpdate = this.props.params.map != nextProps.params.map;
    console.log('require map view update', this.requireMapViewUpdate);

    console.log('previous selectedItem --', _.get(this.props.selectedItem, '_id', null));
    console.log('new selectedItem --', _.get(nextProps.selectedItem, '_id', null));
    this.requireSelectedItemUpdate = _.get(this.props.selectedItem, '_id', null) != _.get(nextProps.selectedItem, '_id', null);
    console.log('require selected item update', this.requireSelectedItemUpdate);

    console.groupEnd('componentWillReceiveProps');
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    console.log('componentDidMount MapBoxMap');

    this.map = L.mapbox.map(this.getDOMNode().querySelector('#map'), config.map.baseLayer, {
      zoomControl: false,
      minZoom : config.map.minZoom,
      maxZoom : config.map.maxZoom,
      maxBounds: L.latLngBounds([-90, -180], [90, 180])
    });

    // Custom zoom control.
    var zoom = new dsZoom({
      position: 'bottomleft',
      containerClasses: 'zoom-controls',
      zoomInClasses: 'bttn-zoomin',
      zoomOutClasses: 'bttn-zoomout',
    });
    this.map.addControl(zoom);

    this.mapGridLayer = L.geoJson(null, { style: L.mapbox.simplestyle.style }).addTo(this.map);
    // Footprint layer.
    this.mapOverFootprintLayer = L.geoJson(null, { style: L.mapbox.simplestyle.style }).addTo(this.map);
    this.mapSelectedSquareLayer = L.geoJson(null).addTo(this.map);

    this.mapGridLayer.on('mouseover', this.onGridSqrOver);
    this.mapGridLayer.on('mouseout', this.onGridSqrOut);
    this.mapGridLayer.on('click', this.onGridSqrClick);

    // Map position from path.
    var mapString = this.stringToMapView(this.props.params.map);
    var view = [mapString.lat, mapString.lng];
    var zoom = mapString.zoom;
    this.map.setView(view, zoom);

    this.map.on('moveend', this.onMapMoveend);

    this.updateGrid();
    this.updateSelectedSquare();
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(prevProps, prevState) {
    console.log('componentDidUpdate');

    // Is there a need to update the map view.
    if (this.requireMapViewUpdate) {
      var routerMap = this.stringToMapView(this.props.params.map);
      this.map.setView([routerMap.lat, routerMap.lng], routerMap.zoom);
      console.log('componentDidUpdate', 'map view updated');
    }
    this.updateGrid();
    this.updateSelectedSquare();

    if (this.requireSelectedItemUpdate) {
      this.updateSelectedItemImageFootprint();
    }
  },

  // Lifecycle method.
  render: function() {
    return (
      <div>
        <div id="map"></div>
      </div>
    );
  },

  // Map event
  onMapMoveend: function(e) {
    console.log('event:', 'moveend');

    var routes = this.getRoutes();
    var params = _.cloneDeep(this.getParams());
    params.map = this.mapViewToString();
    var routeName = routes[routes.length - 1].name || 'map';
    this.replaceWith(routeName, params, this.getQuery());
  },

  // Map event
  onGridSqrOver: function(e) {
    // On mouseover add gs-highlight.
    if (!this.getSqrQuadKey() && e.layer.feature.properties.count > 0) {
      L.DomUtil.addClass(e.layer._path, 'gs-highlight');
      // Open popup on square center.
      var sqrCenter = centroid(e.layer.feature).geometry.coordinates;
      e.layer.openPopup([sqrCenter[1], sqrCenter[0]]);
    }
  },

  // Map event
  onGridSqrOut: function(e) {
    // On mouseover remove gs-highlight.
    L.DomUtil.removeClass(e.layer._path, 'gs-highlight');
    e.layer.closePopup();
  },

  // Map event
  onGridSqrClick: function(e) {
    console.log('onGridSqrClick', e);
    // Ensure that the popup doesn't open.
    e.layer.closePopup();

    if (this.props.params.square) {
      console.log('onGridSqrClick', 'There was a square selected. UNSELECTING');
      // There is a square selected. Unselect.
      this.transitionTo('map', {map: this.props.params.map}, this.getQuery());
    }
    else {
      console.log('onGridSqrClick', 'No square selected. SELECTING');
      var quadKey = e.layer.feature.properties._quadKey;
      var z = Math.round(this.map.getZoom());
      var squareCenter = centroid(e.layer.feature).geometry.coordinates;
      var mapView = utils.getMapViewString(squareCenter[0], squareCenter[1], z);
      console.log('transition /:map/:square', {map: mapView, square: quadKey});
      this.transitionTo('results', {map: mapView, square: quadKey}, this.getQuery());
    }
  },

  // Actions listener.
  onGeocoderResult: function(bounds) {
    if (bounds) {
      // Move the map.
      this.map.fitBounds(bounds);
      this.transitionTo('map', {map: this.mapViewToString()}, this.getQuery());
    }
  },

  // Action listener
  onResultOver: function(feature) {
    var f = utils.getPolygonFeature(feature.geojson.coordinates);
    this.mapOverFootprintLayer.clearLayers().addData(f);
    this.mapOverFootprintLayer.eachLayer(function(l) {
      L.DomUtil.addClass(l._path, 'g-footprint');
    });
  },

  // Action listener
  onResultOut: function() {
    this.mapOverFootprintLayer.clearLayers();
  },

  updateGrid: function () {
    var _this = this;
    console.groupCollapsed('updateGrid');
    this.mapGridLayer.clearLayers();

    // Recompute grid based on current map view (bounds + zoom).
    var bounds = this.map.getBounds().toBBoxString().split(',').map(Number);
    var gridData = this.computeGrid(this.map.getZoom(), bounds);

    // Stick a 'count' property onto each grid square, based on the number of
    // footprints that intersect with the square.
    console.time('aggregate on grid');
    gridData.features.forEach(function (gridSquare) {
      gridSquare = utils.wrap(gridSquare);
      var featureCenter = turf.centroid(gridSquare);
      // The footprints with bboxes that intersect with this grid square.
      // Get all the footprints inside the current square.
      var foots = mapStore.getFootprintsInSquare(gridSquare);
      // Filter with whatever filters are set.
      foots = foots.filter(function (foot) {
        // In the real browser we can filter these footprints based on whatever
        // filter the user has currently selected.
        return true;
      })
      // Filter to ensure that the footprint is really inside the square
      // an not just its bounding box.
      .filter(function (foot) {
        var footprint = foot.feature;
        var footprintCenter = centroid(footprint);
        return inside(featureCenter, footprint) || inside(footprintCenter, gridSquare) || overlaps(footprint, gridSquare);
      });
      gridSquare.properties.count = foots.length;
    });
    console.timeEnd('aggregate on grid');

    // Color the grid accordingly.
    this.mapGridLayer.addData(gridData);
    this.mapGridLayer.eachLayer(function(l) {
      var elClasses = ['gs'];

      // Is there a square selected?
      // When there is a square selected, gs-inactive to everything.
      if (_this.getSqrQuadKey()) {
        elClasses.push('gs-inactive');
      }
      else {
        // Gradation.
        if (l.feature.properties.count >= 10) {
          elClasses.push('gs-density-high');
        }
        else if (l.feature.properties.count >= 5) {
          elClasses.push('gs-density-med');
        }
        else if (l.feature.properties.count > 0) {
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

    console.groupEnd('updateGrid');
  },

  updateSelectedSquare: function() {
    // Clear the selected square layer.
    this.mapSelectedSquareLayer.clearLayers();
    // If there is a selected square add it to its own layer.
    // In this way we can scale the grid without touching the selected square.
    if (this.getSqrQuadKey()) {
      var qk = this.getSqrQuadKey();
      var coords = utils.coordsFromQuadkey(qk);
      var f = utils.getPolygonFeature(coords);

      this.mapSelectedSquareLayer.addData(f).eachLayer(function(l) {
        L.DomUtil.addClass(l._path, 'gs-active gs');
      });
    }
  },

  updateSelectedItemImageFootprint: function() {
    if (this.map.hasLayer(this.mapOverImageLayer)) {
      this.map.removeLayer(this.mapOverImageLayer);
    }
    if (this.props.selectedItem) {
      var item = this.props.selectedItem;
      var imageBounds = [[item.bbox[1], item.bbox[0]], [item.bbox[3], item.bbox[2]]];
      this.mapOverImageLayer = L.imageOverlay(item.properties.thumbnail, imageBounds);

      this.map.addLayer(this.mapOverImageLayer);
    }
  },

  // Helper functions

  getSqrQuadKey: function () {
    return this.props.params.square;
  },

  /**
   * Build a grid for the given zoom level, within the given bbox
   *
   * @param {number} zoom
   * @param {Array} bounds [minx, miny, maxx, maxy]
   */
  computeGrid: function (zoom, bounds) {
    console.time('grid');
    // We'll use tilebelt to make pseudo-tiles at a zoom three levels higher
    // than the given zoom.  This means that for each actual map tile, there will
    // be 4^3 = 64 grid squares.
    zoom += 3;
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
    console.timeEnd('grid');
    return {
      type: 'FeatureCollection',
      features: boxes
    }
  },

  /**
   * Converts the map view (coords + zoom) to use on the path.
   * 
   * @return string
   */
  mapViewToString: function() {
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
  stringToMapView: function(string) {
    var data = string.split(',');
    return {
      lng: data[0],
      lat: data[1],
      zoom: data[2],
    }
  }
});

module.exports = Map;
