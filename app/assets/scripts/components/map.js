'use strict';

var mapboxgl = require('mapbox-gl');
var makeStyle = require('../map_styles/style');
var validate = require('mapbox-gl-style-spec').validate;

var turf = require('turf');
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var _ = require('lodash');
var actions = require('../actions/actions');
var config = require('../config.js');
var utils = require('../utils/utils');

mapboxgl.accessToken = config.map.mapbox.glAccessToken;

var Map = React.createClass({
  mixins: [
    Reflux.listenTo(actions.resultOver, "onResultOver"),
    Reflux.listenTo(actions.resultOut, "onResultOut"),

    Reflux.listenTo(actions.geocoderResult, "onGeocoderResult"),

    Router.Navigation,
    Router.State
  ],

  map: null,

  // Whether the square is following the cursor.
  follow: true,

  // Quadkey of the tile we're currently hovering.
  // Used to limit the calls to featureAt.
  hoverTileQuadkey: null,

  // Flags to control when to perform certain updates.
  requireStyleUpdate: true,
  requireMapViewUpdate: true,
  requireSelectedItemUpdate: true,
  // When the map location is updated by a geocoder search, if there's a
  // selected square it must be unselected.
  requireSquareUnselect: false,

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    console.log('componentDidMount MapBoxMap');
    var _this = this;
    var view = config.map.initialView;
    var zoom = config.map.initialZoom;

    // Map position from path.
    var routerMap = this.props.params.map;
    if (routerMap) {
      routerMap = this.stringToMapView(routerMap);
      view = [routerMap.lng, routerMap.lat];
      zoom = routerMap.zoom;
    }

    var stylesheet = makeStyle(this.props.styleProperty, 16, 100);
    if (!_this.validateStyle(stylesheet)) {
      return;
    }
      
    this.map = new mapboxgl.Map({
      container: this.getDOMNode().querySelector('#map'),
      style: stylesheet,
      center: view,
      zoom: zoom,
      minZoom: 2
    });

    this.map.dragRotate.disable();
    this.map.addControl(new mapboxgl.Navigation({
      position: 'top-left'
    }));

    _this.map.on('load', this.onMapLoad);
    _this.map.on('click', this.onMapClick);
    _this.map.on('mousemove', this.onMapMousemove)
    _this.map.on('moveend', this.onMapMoveend);
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('**--**--**--**--**--**--**--**--**--**--');
    console.log('componentWillReceiveProps');

    console.log('previous style property --', this.props.styleProperty);
    console.log('new style property --', nextProps.styleProperty);
    this.requireStyleUpdate = this.props.styleProperty != nextProps.styleProperty;
    console.log('require style update', this.requireStyleUpdate);

    console.log('previous map view --', this.props.params.map);
    console.log('new map view --', nextProps.params.map);
    this.requireMapViewUpdate = this.props.params.map != nextProps.params.map;
    console.log('require map view update', this.requireMapViewUpdate);

    console.log('previous selectedItem --', _.get(this.props.selectedItem, '_id', null));
    console.log('new selectedItem --', _.get(nextProps.selectedItem, '_id', null));
    this.requireSelectedItemUpdate = _.get(this.props.selectedItem, '_id', null) != _.get(nextProps.selectedItem, '_id', null);
    console.log('require selected item update', this.requireSelectedItemUpdate);

    console.log('**--**--**--**--**--**--**--**--**--**--');
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(prevProps, prevState) {
    console.log('componentDidUpdate');

    if (this.requireStyleUpdate) {
      var stylesheet = makeStyle(this.props.styleProperty, 16, 100);
      if (this.validateStyle(stylesheet)) {
        this.map.setStyle(stylesheet);
      }
    }

    // Only recenter if the current view is different from the one
    // provided by the router.
    // This will trigger a map moveend event.
    if (this.requireMapViewUpdate) {
      var routerMap = this.stringToMapView(this.props.params.map);
      this.map
        .setCenter([routerMap.lng, routerMap.lat])
        .setZoom(routerMap.zoom);
    }

    // Select the square if there's one.
    this.selectSquare(this.props.params.square);

    if (this.requireSelectedItemUpdate) {
      //this.updateSelectedItemImageFootprint();
    }
  },

  render: function() {
    return (
      <div>
        <div id="map"></div>
      </div>
    );
  },

  // Map event
  onMapLoad: function(e) {
    console.log('MAP -- LOADED --');
    this.selectSquare(this.props.params.square);
  },

  // Map event
  onMapMoveend: function(e) {
    console.log('event:', 'moveend');

    if (this.requireSquareUnselect) {
      this.requireSquareUnselect = false;
      this.replaceWith('map', {map: this.mapViewToString()}, this.getQuery());
    }
    else {
      var routes = this.getRoutes();
      var params = _.cloneDeep(this.getParams());
      params.map = this.mapViewToString();
      var routeName = routes[routes.length - 1].name || 'map';
      this.replaceWith(routeName, params, this.getQuery());
    }
  },

  // Map event
  onMapMousemove: function(e) {
    var _this = this;
    if (!this.follow) {
      return;
    }

    // A square at zoom Z is the same as a map tile at zoom Z+3
    var z = Math.round(this.map.getZoom());
    var quadKey = utils.quadkeyFromCoords(e.lngLat.lng, e.lngLat.lat, z);

    if (this.hoverTileQuadkey == quadKey) {
      return;
    }
    this.hoverTileQuadkey = quadKey;

    this.map.featuresAt(e.point, { includeGeometry: true }, function (err, features) {
      if (err) throw err;
      var src = _this.map.getSource('grid-hover');
      if (src) {
        src.setData(turf.featurecollection(features));
        _this.map.getSource('grid-hover-num').setData(turf.featurecollection(features));
      }
    });
  },

  // Map event
  onMapClick: function(e) {
    console.log('clicked point', e.point);
    var _this = this;

    if (this.follow) {

      this.map.featuresAt(e.point, { includeGeometry: false }, function (err, features) {
        if (err) throw err;
        if (features[0].properties[_this.props.styleProperty] <= 0) {
          return;
        }

        var z = Math.round(_this.map.getZoom());
        var quadKey = utils.quadkeyFromCoords(e.lngLat.lng, e.lngLat.lat, z);
        var squareCenter = utils.tileCenterFromCoords(e.lngLat.lng, e.lngLat.lat, z);
        var mapView = utils.getMapViewString(squareCenter[0], squareCenter[1], z);

        console.log('----------------------------------------------');
        console.log('SELECTED -- (was following)');
        console.log('current map zoom', z);
        console.log('a square at zoom', z, 'is the same as a map tile at zoom', z + 3);
        console.log('quadKey', quadKey);
        console.log('squareCenter', squareCenter);
        console.log('mapView', mapView);
        console.log('transition /:map/:square', {map: mapView, square: quadKey});
        console.log('----------------------------------------------');
        _this.transitionTo('results', {map: mapView, square: quadKey}, _this.getQuery());
      });
    }
    else {
      console.log('----------------------------------------------');
      console.log('UNSELECTED -- (was not following)');
      console.log('transition /:map', {map: this.props.params.map });
      console.log('----------------------------------------------');
      this.transitionTo('map', {map: this.props.params.map}, this.getQuery());
    }
  },

  // Actions listener.
  onGeocoderResult: function(bounds) {
    if (bounds) {
      // Move the map.
      this.requireSquareUnselect = true;
      this.map.fitBounds(bounds);
    }
  },

  // Action listener
  onResultOver: function(data) {
    console.log('map onResultsOver');
    var src = this.map.getSource('result-footprint');
    var f = turf.polygon(data.geojson.coordinates);
    if (src) {
      src.setData(turf.featurecollection([f]));
    }
  },

  // Action listener
  onResultOut: function() {
    console.log('map onResultOut');
    var src = this.map.getSource('result-footprint');
    if (src) {
      src.setData(turf.featurecollection([]));
    }
  },

  // Selects a square using the quadKey.
  // The square has to be within the viewport.
  selectSquare: function(quadKey) {
    console.log('=======================================');
    if (!quadKey) {
      this.follow = true;
      console.log('There is no square (quadKey)');
      console.log('=======================================');
      return false;
    }

    var _this = this;
    var point = utils.tileCenterFromQuadkey(quadKey)
    var pxcoords = _this.map.project(point.geometry.coordinates);
    console.log('tile center', point);
    console.log('pxcoords from point', pxcoords);

    _this.map.featuresAt(pxcoords, { includeGeometry: true }, function (err, features) {
      console.log('=/=/=/=/=/=/=/=/=/=/=/=/=/=');
      console.log('features from pxcoords', features);
      var src = _this.map.getSource('grid-hover');
      if (src) {
        console.log('setting sources');
        src.setData(turf.featurecollection(features));
        console.log('stopping follow');
        _this.follow = false;
      }

      console.log('=/=/=/=/=/=/=/=/=/=/=/=/=/=');
    });
    console.log('=======================================');
  },

  updateSelectedItemImageFootprint: function() {
    try {
      // Try to delete the source and layer if they exist.
      this.map.removeSource('image-footprint-src');
      this.map.removeLayer('image-footprint-layer');
    }
    catch (e) {}

    if (this.props.selectedItem) {
      console.log('There is a selected item');

      var coords = _.cloneDeep(this.props.selectedItem.geojson.coordinates[0]);
      coords.pop();

      var sourceObj = new mapboxgl.ImageSource({
        url: this.props.selectedItem.properties.thumbnail,
        //url: '/assets/images/LC80150332015005LGN00.jpg',
        coordinates: coords
      });
      console.log(this.props.selectedItem.properties.thumbnail);
      this.map.addSource('image-footprint-src', sourceObj);
      this.map.addLayer({
        id: 'image-footprint-layer',
        type: 'raster',
        source: 'image-footprint-src',
        paint: {
          'raster-opacity': 0.5
        },
      });
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
  },

  validateStyle: function (stylesheet) {
    // validate the stylesheet (useful for development purposes)
    var valid = validate(JSON.stringify(stylesheet));
    if (valid.length) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      valid.forEach(function (e) { console.error(e); });
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      return false;
    }
    return true;
  }

});

module.exports = Map;
