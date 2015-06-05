'use strict';
require('mapbox.js');
var React = require('react/addons');
var Reflux = require('reflux');
var overlaps = require('turf-overlaps');
// Not working. Using cdn. (turf.intersect was throwing a weird error)
//var turf = require('turf');
var actions = require('../actions/actions');
var mapStore = require('../stores/map_store');
var resultsStore = require('../stores/results_store');
var utils = require('../utils/utils');
var dsZoom = require('../utils/ds_zoom');

L.mapbox.accessToken = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q';

var Map = React.createClass({
  // Connect to the store "mapStore". Whenever the store calls "this.trigger()"
  // the "onMapData" function will be notified.
  // The listener could be setup manually but in this way Reflux takes care of
  // removing the listener when the component is unmounted. 
  mixins: [
    Reflux.listenTo(mapStore, "onMapData"),
    Reflux.listenTo(actions.mapSquareSelected, "onMapSquareSelected"),
    Reflux.listenTo(actions.mapSquareUnselected, "onMapSquareUnselected"),
    Reflux.listenTo(actions.resultOver, "onResultOver"),
    Reflux.listenTo(actions.resultOut, "onResultOut"),
    Reflux.listenTo(actions.resultItemSelect, "onResultItemSelect"),
    Reflux.listenTo(actions.resultItemView, "onResultItemView"),
    Reflux.listenTo(actions.resultListView, "onResultListView"),

    Reflux.listenTo(actions.goToLatest, "onGoToLatest"),
    Reflux.listenTo(actions.geocoderResult, "onGeocoderResult"),
  ],

  map: null,

  // Layers.
  polysLayer: null, // debug
  gridLayer: null,
  fauxLineGridLayer: null,
  // Layer to store the footprint when hovering a result. 
  overFootprintLayer: null,
  // Layer with the image of the selected result.
  overImageLayer: null,

  // When the user clicks browse latest imagery we move the map to the correct
  // locations. Then, when the query is finished and the map rendered we
  // need to select the correct square.
  // Here we store the bbox of the latest imagery and use it to select the
  // square that contains it. Check updateGrid()
  selectIntersecting: null,

  getInitialState: function() {
    return {
      loading: true
    };
  },

  // Store listener.
  onMapData: function(data) {
    this.setState({
      mapData: data,
      loading: false
    });
  },

  // Actions listener.
  onResultItemSelect: function() {
    // Remove footprint highlight.
    this.overFootprintLayer.clearLayers();
  },

  // Actions listener.
  onResultItemView: function(item) {
    if (this.map.hasLayer(this.overImageLayer)) {
      this.map.removeLayer(this.overImageLayer);
    }

    var imageBounds = [[item.bbox[1], item.bbox[0]], [item.bbox[3], item.bbox[2]]];
    this.overImageLayer = L.imageOverlay(item.properties.thumbnail, imageBounds);

    this.map.addLayer(this.overImageLayer);
  },

  // Actions listener.
  onResultListView: function() {
    if (this.map.hasLayer(this.overImageLayer)) {
      this.map.removeLayer(this.overImageLayer);
    }
  },

  // Actions listener.
  onMapSquareSelected: function(sqrFeature) {
    var intersected = mapStore.getResultsIntersect(sqrFeature);
    actions.resultsChange(intersected);

    // On click, center the square.
    // Coordinates must be inverted for panTo.
    this.map.panTo([sqrFeature.properties.centroid[1], sqrFeature.properties.centroid[0]]);

    this.updateGrid();
  },

  // Actions listener.
  onMapSquareUnselected: function() {
    actions.resultsChange([]);
    this.updateGrid();
  },

  // Actions listener.
  onResultOver: function(feature) {
    var f = utils.getPolygonFeature(feature.geojson.coordinates);
    this.overFootprintLayer.clearLayers().addData(f);
    this.overFootprintLayer.eachLayer(function(l) {
      L.DomUtil.addClass(l._path, 'g-footprint');
    });
  },

  // Actions listener.
  onResultOut: function(feature) {
    this.overFootprintLayer.clearLayers();
  },

  // Actions listener.
  onGoToLatest: function() {
    var latest = mapStore.getLatestImagery();
    if (latest) {
      // Get feature center and since we're at it store it in the properties.
      var latestCenter = turf.centroid(latest);
      latest.properties = latest.properties || {};
      latest.properties.centroid = latestCenter;
      this.selectIntersecting = latest;
      // Move the map
      this.map.setView([latestCenter.geometry.coordinates[1], latestCenter.geometry.coordinates[0]], 8);
    }
  },

  // Actions listener.
  onGeocoderResult: function(bounds) {
    if (bounds) {
      // Move the map
      this.map.fitBounds(bounds);
    }
  },

  // Redraws the line grid.
  // This is a pixel grid with 200px squares at zoom level 8.
  updateFauxGrid: function() {
    var bounds = this.map.getBounds();
    var extent = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

    var grid = this.linePixelGrid(extent, 200, 8);

    this.fauxLineGridLayer.clearLayers().addData(grid);
    this.fauxLineGridLayer.eachLayer(function(l) {
      L.DomUtil.addClass(l._path, 'gl');
    });
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
      var f = utils.getPolygonFeature(o.geojson.coordinates);
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
    this.gridLayer.clearLayers();
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

      mapStore.forEachResultIntersecting(feature, function(result) {
        intersectCount++;
      });

      feature.properties = {
        intersectCount: intersectCount,
      }
    });
    //console.timeEnd('intersect');
    // First render clocked at 50ms
    // Zooming out once clocks 240ms
    
    // Layer from geojson.
    this.gridLayer.addData(squareGrid);
    this.gridLayer.eachLayer(function(l) {
      L.DomUtil.addClass(l._path, 'gs');
      var featureCenter = null;

      // Select the square that intersects the stored image.
      if (_this.selectIntersecting) {
        featureCenter = turf.centroid(l.feature);

        var latestFeature = utils.getPolygonFeature(_this.selectIntersecting.coordinates);
        if (turf.inside(featureCenter, latestFeature) || turf.inside(_this.selectIntersecting.properties.centroid, l.feature) || overlaps(latestFeature, l.feature)) {
          // Done with selecting.
          _this.selectIntersecting = null;
          // Trigger action.
          actions.mapSquareSelected(l.feature);
          return;
        }
      }

      // If there's a square selected.
      if (mapStore.isSelectedSquare()) {
        var selSqrCenter = mapStore.getSelectedSquareCenter();

        featureCenter = turf.centroid(l.feature);

        // Color the selected square.
        if (selSqrCenter[0] == featureCenter.geometry.coordinates[0] &&
          selSqrCenter[1] == featureCenter.geometry.coordinates[1]) {
          L.DomUtil.addClass(l._path, 'gs-active');
          // No gradation for active square.
          return;
        }
        else {
           L.DomUtil.addClass(l._path, 'gs-inactive');
        }
      }

      var intersectCount = l.feature.properties.intersectCount;
      // Gradation.
      if (intersectCount >= 10) {
        L.DomUtil.addClass(l._path, 'gs-density-high');
      }
      else if (intersectCount >= 5) {
        L.DomUtil.addClass(l._path, 'gs-density-med');
      }
      else if (intersectCount > 0) {
        L.DomUtil.addClass(l._path, 'gs-density-low');
      }

    });
    this.gridLayer.bringToBack();
    return this;
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    console.log('componentDidMount MapBoxMap');
    var _this = this;
    var view = [60.177, 25.148];

    this.map = L.mapbox.map(this.getDOMNode().querySelector('#map'), 'devseed.m9i692do', {
      zoomControl: false,
      minZoom : 4,
      //maxZoom : 18,
      maxBounds: L.latLngBounds([-90, -180], [90, 180])
    }).setView(view, 6);

    // Custom zoom control.
    var zoom = new dsZoom({
      position: 'bottomleft',
      containerClasses: 'zoom-controls',
      zoomInClasses: 'bttn-zoomin',
      zoomOutClasses: 'bttn-zoomout',
    });
    this.map.addControl(zoom);

    // Prepare layers. Their data will be updated when needed.
    this.fauxLineGridLayer = L.geoJson(null, { style: L.mapbox.simplestyle.style }).addTo(this.map);

    // Grid layer colorized.
    this.gridLayer = L.geoJson(null, { style: L.mapbox.simplestyle.style }).addTo(this.map);
    // On click select the square.
    this.gridLayer.on('click', function(e) {
      // No previous square selected.
      if (mapStore.isSelectedSquare()) {
        // Unselect.
        actions.mapSquareUnselected();
      }
      else {
        // Can only select if there's data.
        if (e.layer.feature.properties.intersectCount > 0) {
          // Select.
          actions.mapSquareSelected(e.layer.feature);
        }
      }
    });
    // On mouseover add gs-highlight.
    this.gridLayer.on('mouseover', function(e) {
      if (!mapStore.isSelectedSquare() && e.layer.feature.properties.intersectCount > 0) {
        L.DomUtil.addClass(e.layer._path, 'gs-highlight');
      }
    });
    // On mouseout remove gs-highlight.
    this.gridLayer.on('mouseout', function(e) {
      L.DomUtil.removeClass(e.layer._path, 'gs-highlight');
    });

    // Footprint layer.
    this.overFootprintLayer = L.geoJson(null, { style: L.mapbox.simplestyle.style }).addTo(this.map);

    // Map move listener.
    this.map.on('moveend', function() {
      _this.setState({loading: true});
      actions.mapMove(_this.map);
      _this.updateFauxGrid();
    });

    // Create fauxGrid.
    this.updateFauxGrid();
    // Manually trigger mapMove to force first load.
    actions.mapMove(this.map);
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(/*prevProps, prevState*/) {
    console.log('componentDidUpdate');
    //this.updatePolys();
    this.updateGrid();
  },

  render: function() {
    return (
      <div>
        {this.state.loading ? <p className="loading revealed">Loading</p> : null}
        <div id="map"></div>
      </div>
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