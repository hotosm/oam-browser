'use strict';

// require('mapbox.js');

var mapboxgl = require('mapbox-gl');
var makeStyle = require('../map_styles/style');
var validate = require('mapbox-gl-style-spec').validate;
var turf = require('turf');
var tilebelt = require('tilebelt');


var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var _ = require('lodash');
var overlaps = require('turf-overlaps');
// Not working. Using cdn. (turf.intersect was throwing a weird error)
//var turf = require('turf');
var actions = require('../actions/actions');
var mapStore = require('../stores/map_store');
var resultsStore = require('../stores/results_store');
var searchQueryStore = require('../stores/search_query_store');
var utils = require('../utils/utils');
// var dsZoom = require('../utils/ds_zoom');
var config = require('../config.js');

// L.mapbox.accessToken = config.map.mapbox.accessToken;
mapboxgl.accessToken = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q'


var Map = React.createClass({
  mixins: [
    Reflux.listenTo(searchQueryStore, 'onSearchQueryChanged'),

    Router.Navigation,
    Router.State
  ],

  map: null,

  // Whether the square is following the cursor.
  follow: true,

  // What triggered the component update.
  componentUpdateOrigin: null,

  getInitialState: function() {
    return {
      style: {
        property: 'all_all_all_count'
      }
    };
  },

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

    var stylesheet = makeStyle(this.state.style.property, 16, 100);
    if (!validateStyle(stylesheet)) {
      return;
    }
      
    this.map = new mapboxgl.Map({
      container: this.getDOMNode().querySelector('#map'),
      style: stylesheet,
      center: view,
      zoom: zoom
      // center: [-74.50, 40],
      // zoom: 8
    });

    _this.map.on('load', function (e) {
      console.log('MAP -- LOADED --');
      _this.selectSquare(_this.props.params.square);
    });

    _this.map.on('click', function (e) {
      console.log('clicked point', e.point);
      // Weird stuff happening:
      // The map click triggers a moveend event before the click itself.
      // (Why? Good question!)
      // This gets executed but since there are no changes (map string is the
      // same) the component doesn't get updated.
      // This results in "componentUpdateOrigin" being moveend which will
      // reject the next update. To solve the problem it is reset here.
      // _this.componentUpdateOrigin = null;

      if (_this.follow) {
        // A square at zoom Z is the same as a map tile at zoom Z+3
        var z = Math.round(_this.map.getZoom());
        var tile = tilebelt.pointToTile(e.lngLat.lng, e.lngLat.lat, z + 3);
        var geoJSONTile = tilebelt.tileToGeoJSON(tile);
        var quadKey = tilebelt.tileToQuadkey(tile);
        var squareCenter = turf.centroid(geoJSONTile);
        var mapView = squareCenter.geometry.coordinates.concat(z).join(',');

        console.log('----------------------------------------------');
        console.log('SELECTED -- (was following)');
        console.log('current map zoom', z);
        console.log('a square at zoom', z, 'is the same as a map tile at zoom', z + 3);
        console.log('tile at zoom', z + 3, tile);
        console.log('tileToGeoJSON', geoJSONTile);
        console.log('tileToQuadkey', quadKey);
        console.log('squareCenter', squareCenter);
        console.log('mapView', mapView);
        console.log('transition /:map/:square', {map: mapView, square: quadKey});
        console.log('----------------------------------------------');
        _this.follow = false;
        _this.transitionTo('results', {map: mapView, square: quadKey}, _this.getQuery());
      }
      else {
        console.log('----------------------------------------------');
        console.log('UNSELECTED -- (was not following)');
        console.log('transition /:map', {map: _this.props.params.map });
        console.log('----------------------------------------------');
        // _this.follow = true;
        // actions.mapSquareUnselected();
        // _this.transitionTo('map', {map: _this.props.params.map});
        _this.unselectSquare();
      }
    });

    // Track mouse movements, use it to look up the feature properties from the
    // vector tiles underneath the mouse
    _this.map.on('mousemove', function (e) {
      if (!_this.follow) {
        return;
      }

      _this.map.featuresAt(e.point, { includeGeometry: true }, function (err, features) {
        if (err) throw err;
        var src = _this.map.getSource('grid-hover');
        if (src) {
          src.setData(turf.featurecollection(features));
        }
      });
    })


    _this.map.on('moveend', function (e) {
      console.log('event:', 'moveend');
      
      var routes = _this.getRoutes();
      var params = _.clone(_this.getParams());
      params.map = _this.mapViewToString();
       _this.replaceWith(routes[routes.length - 1].name, params, _this.getQuery());
    });
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(prevProps, prevState) {
    console.log('componentDidUpdate');

    console.log('prevProps map view --', prevProps.params.map);
    console.log('current map view --', this.mapViewToString());
    console.log('newProps map view --', this.props.params.map);

    console.log('current style property --', this.state.style.property);
    console.log('prevState style property --', prevState.style.property);
    if (this.state.style.property != prevState.style.property) {
      var stylesheet = makeStyle(this.state.style.property, 16, 100);
      if (validateStyle(stylesheet)) {
        this.map.setStyle(stylesheet);
      }
    }

    // Only recenter if the current view is different from the one
    // provided by the router.
    // This will trigger a map moveend event.
    if (this.mapViewToString() != this.props.params.map) {
      var routerMap = this.stringToMapView(this.props.params.map);
      this.map
        .setCenter([routerMap.lng, routerMap.lat])
        .setZoom(routerMap.zoom);
    }

    // Select the square if there's one.
    this.selectSquare(this.props.params.square);
  },

  render: function() {
    return (
      <div>
        <div id="map"></div>
      </div>
    );
  },

  onSearchQueryChanged: function(params, changeTrigger) {
    console.log('map onSearchQueryChanged');
    console.log('query change trigger --', changeTrigger);
    // When the bbox changes we don't want to do anything, otherwise we'd
    // be causing an infinite loop. 
    if (changeTrigger == 'bbox') {
      return;
    }
    var style = _.clone(this.state.style);
    style.property = params.date + '_' + params.resolution + '_' + params.dataType + '_count';
    console.log('changing map style', style);
    this.unselectSquare();
    this.setState({ style: style });
  },

  unselectSquare: function() {
    this.follow = true;
    actions.mapSquareUnselected();
    this.transitionTo('map', {map: this.props.params.map}, this.getQuery());
  },

  // Selects a square using the quadKey.
  // The square has to be within the viewport.
  selectSquare: function(quadKey) {
    console.log('=======================================');
    if (!quadKey) {
      console.log('There is no square (quadKey)');
      console.log('=======================================');
      return false;
    }

    var _this = this;
    var tile = tilebelt.quadkeyToTile(quadKey);
    var geo = tilebelt.tileToGeoJSON(tile);
    var point = turf.pointOnSurface(geo);
    var pxcoords = _this.map.project(point.geometry.coordinates);
    console.log('tile from a quadkey', tile);
    console.log('geoJSON from tile', geo);
    console.log('point from geoJSON', point);
    console.log('pxcoords from point', pxcoords);

    _this.map.featuresAt(pxcoords, { includeGeometry: true }, function (err, features) {
      console.log('=/=/=/=/=/=/=/=/=/=/=/=/=/=');
      console.log('features from pxcoords', features);
      console.log('setting sources');
      _this.map.getSource('grid-hover').setData(turf.featurecollection(features));
      console.log('stopping follow');
      _this.follow = false;

      console.log('features of selected square', features);
      actions.mapSquareSelected(features[0]);

      console.log('=/=/=/=/=/=/=/=/=/=/=/=/=/=');
    });
    console.log('=======================================');
  },

  /**
   * Converts the map view (coords + zoom) to use on the path.
   * 
   * @return string
   */
  mapViewToString: function() {
    var center = this.map.getCenter();
    var zoom = Math.round(this.map.getZoom());
    return center.lng + ',' + center.lat + ',' + zoom;
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

});

module.exports = Map;


function validateStyle (stylesheet) {
  // validate the stylesheet (useful for development purposes)
  var valid = validate(JSON.stringify(stylesheet))
  if (valid.length) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    valid.forEach(function (e) { console.error(e); });
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    return false
  }
  return true
}