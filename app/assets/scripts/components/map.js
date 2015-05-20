'use strict';
require('mapbox.js');
var React = require('react');
var Reflux = require('reflux');
// Not working. Using cdn. (turf.intersect was throwing a weird error)
//var turf = require('turf');
var actions = require('../actions/actions');
var mapStore = require('../stores/map_store');
var resultsStore = require('../stores/results_store');
var overlaps = require('turf-overlaps');

L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';

var Map = React.createClass({
  // Connect to the store "mapStore". Whenever the store calls "this.trigger()"
  // the "onMapData" function will be notified.
  // The listener could be setup manually but in this way Reflux takes care of
  // removing the listener when the component is unmounted. 
  mixins: [
    Reflux.listenTo(mapStore, "onMapData"),
    Reflux.listenTo(actions.mapSquareSelected, "onMapSquareSelected"),
    Reflux.listenTo(actions.mapSquareUnselected, "onMapSquareUnselected"),
  ],

  map: null,

  // Layers.
  polysLayer: null,
  gridLayer: null,
  fauxLineGridLayer: null,

  // Store listener.
  onMapData: function(data) {
    this.setState({
      mapData: data
    });
  },

  // Actions listener.
  onMapSquareSelected: function(sqrFeature) {
    var intersected = mapStore.getResultsIntersect(sqrFeature);
    actions.resultsChange(intersected);
    // The component will update and with it the grid.
    //this.updateGrid();
  },

  // Actions listener.
  onMapSquareUnselected: function() {
    actions.resultsChange([]);
    actions.resultClose();
    
    // The component will update and with it the grid.
    //this.updateGrid();
  },

  // Redraws the line grid.
  // This is a pixel grid with 200px squares at zoom level 8.
  updateFauxGrid: function() {
    if (this.map.hasLayer(this.fauxLineGridLayer)) {
      this.map.removeLayer(this.fauxLineGridLayer);
    }

    var bounds = this.map.getBounds();
    var extent = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

    var grid = this.linePixelGrid(extent, 200, 8);
    grid.features.forEach(function (feature) {
      feature.properties = {
        'fill-opacity': 0,
        'stroke': '#888888',
        'stroke-width': 0.5
      }
    });
    this.fauxLineGridLayer = L.geoJson(grid, {
      style: L.mapbox.simplestyle.style,
    });
    this.map.addLayer(this.fauxLineGridLayer);

    return this;
  },

  // Draws the image footprint.
  // Used for development.
  updatePolys: function() {
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
        }
      };

      polys.features.push(f);
    });

    this.polysLayer = L.geoJson(polys)
    this.map.addLayer(this.polysLayer);
  },

  // Updates the colored grid.
  // This is a pixel grid with 200px squares at zoom level 8.
  // It is separated from the line grid to allow independent styling of 
  // the stroke/content.
  updateGrid: function() {
    var _this = this;
    if (this.map.hasLayer(this.gridLayer)) {
      this.map.removeLayer(this.gridLayer);
    }

    // Do not draw below zoom level 6
    if (this.map.getZoom() < 6) { return; }

    var bounds = this.map.getBounds();
    var extent = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

    // Square grid to color.
    var squareGrid = this.squarePixelGrid(extent, 200, 8);

    /*
    // How this works:
    // Covert each of the footprints to points.
    // Count how many points intersect each grid square.
    // Compute the density per million of square km.
    // Color the grid.

    // This was dropped in favor of a more performant solution.
    // Leaving here for now. Will remove it when its time comes.

    console.time('points');

    var points = {
      'type': 'FeatureCollection',
      'features': []
    };

    // Covert footprint images to points.
    this.state.mapData.forEach(function(o) {
      points.features = points.features.concat(turf.pointGrid(o.bbox, 0.3, 'degrees').features);
    });

    var squareGrid = turf.count(squareGrid, points, 'pt_count');

    squareGrid.features.forEach(function (feature) {
      var pt_count = feature.properties.pt_count;

      var area = Math.round(turf.area(feature) / 1000 / 1000000);
      // Points per million of square kms. 
      var ppmsk = pt_count / area;

      feature.properties = {
        ppmsk: ppmsk,
        pt_count: pt_count,

        // Style properties. 
        'fill': 'black',
        'fill-opacity': 0,
        'stroke': false
      };

      if (ppmsk > 0) {
        feature.properties['fill-opacity'] = 0.2;
      }
      if (ppmsk >= 5) {
        feature.properties['fill-opacity'] = 0.35;
      }
      if (ppmsk >= 10) {
        feature.properties['fill-opacity'] = 0.55;
      }
    });

    console.timeEnd('points');
    // First render clocked at 80ms
    // Zooming out once clocks 500ms
    */

    // How this approach works:
    // Count how many footprints intersect each square.
    // Color the grid based on that.
    //console.time('intersect');
    squareGrid.features.forEach(function (feature) {
      var intersectCount = 0;

      var featureCenter = turf.centroid(feature);

      mapStore.forEachResultIntersecting(feature, function(result) {
        intersectCount++;
      });

      // Base features.
      feature.properties = {
        intersectCount: intersectCount,
        // Style properties. 
        'fill': 'black',
        'fill-opacity': 0,
        'stroke': false
      }

      // Gradation.
      if (intersectCount >= 10) {
        feature.properties['fill-opacity'] = 0.55;
      }
      else if (intersectCount >= 5) {
        feature.properties['fill-opacity'] = 0.35;
      }
      else if (intersectCount > 0) {
        feature.properties['fill-opacity'] = 0.2;
      }

      // If there's a square selected.
      if (mapStore.isSelectedSquare()) {
        var selSqrCenter = mapStore.getSelectedSquareCenter();

        // Dim everything.
        feature.properties['fill-opacity'] /= 2;

        // Color the selected square.
        if (selSqrCenter[0] == featureCenter.geometry.coordinates[0] &&
          selSqrCenter[1] == featureCenter.geometry.coordinates[1]) {
          feature.properties['fill'] = 'red';
          feature.properties['fill-opacity'] = 0.8;
        }
      }

    });
    //console.timeEnd('intersect');
    // First render clocked at 50ms
    // Zooming out once clocks 240ms
    
    // Layer from geojson.
    var gridLayer = L.geoJson(squareGrid, { style: L.mapbox.simplestyle.style });

    gridLayer.on('click', function(e) {
      // No previous square selected.
      // Select.
      if (mapStore.isSelectedSquare()) {
        actions.mapSquareUnselected();
      }
      else {
        actions.mapSquareSelected(e.layer.feature);
      }
    });

    gridLayer.on('mouseover', function(e) {
      if (!mapStore.isSelectedSquare() && e.layer.feature.properties.intersectCount > 0) {
        e.layer.setStyle({stroke: true, color: 'red'});
      }
    });

    gridLayer.on('mouseout', function(e) {
      e.layer.setStyle({stroke: false});
    });

    this.gridLayer = gridLayer;
    this.map.addLayer(this.gridLayer);
  },

  // Removes all computed layers from map.
  clearMapLayers: function() {
    if (this.map.hasLayer(this.polysLayer)) {
      this.map.removeLayer(this.polysLayer);
      this.polysLayer = null;
    }
    if (this.map.hasLayer(this.gridLayer)) {
      this.map.removeLayer(this.gridLayer);
      this.gridLayer = null;
    }
    if (this.map.hasLayer(this.fauxGridLayer)) {
      this.map.removeLayer(this.fauxGridLayer);
      this.fauxGridLayer = null;
    }

    return this;
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    console.log('componentDidMount MapBoxMap');
    var view = [40.75, -73.9];

    this.map = L.mapbox.map(this.getDOMNode(), 'mapbox.light', {
      zoomControl: false,
      minZoom : 4,
      maxZoom : 18,
      maxBounds: L.latLngBounds([-90, -180], [90, 180])
    }).setView(view, 8);

    // Map move listener.
    this.map.on('moveend', function() {
      actions.mapMove(this.map);
      //this.clearMapLayers();
      this.updateFauxGrid();
    }.bind(this));

    this.updateFauxGrid();

    // Manually trigger mapMove to force first load
    actions.mapMove(this.map);
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(/*prevProps, prevState*/) {
    console.log('componentDidUpdate');
    //console.log(this.state.mapData);
    //this.updatePolys();
    this.updateGrid();
  },

  render: function() {
    return (
      <div id="map"></div>
    );
  },



  /**
   * Creates a equidistant pixel line grid for the given bbox.
   * The grid drawing will start form the closest cellSize multiple thus
   * ensuring that a square always ends up in the same position.
   * 
   * Utility function.
   * 
   * @param  bbox
   *   Bounding box for which to draw the grid.
   * @param   cellSize
   *   The size of the cell.
   * @param   atZoom
   *   The zoom level at which the cellSize is real. When zoomed out or in the
   *   size will be adapted.
   * 
   * @return FeatureCollection
   */
  linePixelGrid: function (bbox, cellSize, atZoom) {
    var fc = turf.featurecollection([]);
    // We want all the squares to be visually equal.
    // They won't have the same physical size but their apparent
    // size in pixels will be the same.
    // To accomplish this we project to pixels and then unproject back
    // to coordinates so they can be drawn on the map.
    var sw = this.map.project(L.latLng(bbox[1], bbox[0]), atZoom);
    var ne = this.map.project(L.latLng(bbox[3], bbox[2]), atZoom);

    // To ensure that the square doesn't move when panning/zooming
    // we start drawing the grid form the closest cellSize multiple.
    var startX = Math.floor(sw.x / cellSize) * cellSize;
    var startY = Math.floor(ne.y / cellSize) * cellSize;

    var currentX = startX;
    while (currentX <= ne.x) {
      var p1 = this.map.unproject(L.point(currentX, sw.y), atZoom);
      var p2 = this.map.unproject(L.point(currentX, ne.y), atZoom);

      var line = turf.linestring([
        [p1.lng, p1.lat],
        [p2.lng, p2.lat]
      ]);
      fc.features.push(line);

      currentX += cellSize;
    }

    var currentY = startY;
    while (currentY <= sw.y) {
      var p1 = this.map.unproject(L.point(sw.x, currentY), atZoom);
      var p2 = this.map.unproject(L.point(ne.x, currentY), atZoom);

      var line = turf.linestring([
        [p1.lng, p1.lat],
        [p2.lng, p2.lat]
      ]);
      fc.features.push(line);

      currentY += cellSize;
    }
    return fc;
  },

  /**
   * Creates a equidistant pixel square grid for the given bbox.
   * The grid drawing will start form the closest cellSize multiple thus
   * ensuring that a square always ends up in the same position.
   * 
   * Utility function.
   * 
   * @param  bbox
   *   Bounding box for which to draw the grid.
   * @param   cellSize
   *   The size of the cell.
   * @param   atZoom
   *   The zoom level at which the cellSize is real. When zoomed out or in the
   *   size will be adapted.
   * 
   * @return FeatureCollection
   */
  squarePixelGrid: function (bbox, cellSize, atZoom) {
    var fc = turf.featurecollection([]);
    // We want all the squares to be visually equal.
    // They won't have the same physical size but their apparent
    // size in pixels will be the same.
    // To accomplish this we project to pixels and then unproject back
    // to coordinates so they can be drawn on the map.
    var sw = this.map.project(L.latLng(bbox[1], bbox[0]), atZoom);
    var ne = this.map.project(L.latLng(bbox[3], bbox[2]), atZoom);

    // To ensure that the square doesn't move when panning/zooming
    // we start drawing the grid form the closest cellSize multiple.
    var startX = Math.floor(sw.x / cellSize) * cellSize;
    var startY = Math.floor(ne.y / cellSize) * cellSize;

    var currentX = startX;
    while (currentX <= ne.x) {
      var currentY = startY;
      while (currentY <= sw.y) {
        var p1 = this.map.unproject(L.point(currentX, currentY), atZoom);
        var p2 = this.map.unproject(L.point(currentX, currentY+cellSize), atZoom);
        var p3 = this.map.unproject(L.point(currentX+cellSize, currentY+cellSize), atZoom);
        var p4 = this.map.unproject(L.point(currentX+cellSize, currentY), atZoom);

        var cellPoly = turf.polygon([[
            [p1.lng, p1.lat],
            [p2.lng, p2.lat],
            [p3.lng, p3.lat],
            [p4.lng, p4.lat],
            [p1.lng, p1.lat]
          ]]);
        fc.features.push(cellPoly);

        currentY += cellSize;
      }
      currentX += cellSize;
    }
    return fc;
  }

});

module.exports = Map;