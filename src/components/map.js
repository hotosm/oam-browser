/* global L */

import React from "react";
import PropTypes from "prop-types";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import _ from "lodash";
import tilebelt from "tilebelt";
import centroid from "turf-centroid";
import inside from "turf-inside";
import overlaps from "turf-overlaps";

import actions from "actions/actions";
import config from "config";
import utils from "utils/utils";
import mapStore from "stores/map_store";
import DSZoom from "utils/ds_zoom";

import "mapbox.js";

L.mapbox.accessToken = config.map.mapbox.accessToken;

export default createReactClass({
  displayName: "Map",

  propTypes: {
    query: PropTypes.object,
    map: PropTypes.object,
    selectedSquareQuadkey: PropTypes.string,
    selectedItemId: PropTypes.string,
    selectedItem: PropTypes.object,
    filterParams: PropTypes.object
  },

  mixins: [
    Reflux.listenTo(actions.resultOver, "onResultOver"),
    Reflux.listenTo(actions.resultOut, "onResultOut"),
    Reflux.listenTo(actions.resultSelected, "onResultSelected"),
    Reflux.listenTo(actions.selectPreview, "onSelectPreview"),
    Reflux.listenTo(actions.fitToBounds, "onFitToBounds"),
    Reflux.listenTo(actions.moveToCoords, "onMoveToCoords"),
    Reflux.listenTo(actions.requestMyLocation, "onRequestMyLocation"),
    Reflux.listenTo(actions.setBaseLayer, "onChangeBaseLayer")
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
  // Add some debounce when updating the map URI
  canMoveMap: true,

  // Current active base layer.
  baseLayer: null,

  onSelectPreview: function(what) {
    this.updateSelectedItemImageFootprint(what);
  },

  componentWillReceiveProps: function(nextProps) {
    this.requireMapViewUpdate = this.props.map.view !== nextProps.map.view;
    this.requireSelectedItemUpdate =
      _.get(this.props.selectedItem, "_id", null) !==
      _.get(nextProps.selectedItem, "_id", null);
    this.updateGrid();
  },

  getMosaicLayerUrl: function(dateFilter, resolutionFilter) {
    const url = config.map.oamMosaicLayer.url;
    const start = dateFilter === "all" ? null : new Date();

    if (dateFilter === "week") {
      start.setDate(start.getDate() - 7);
    } else if (dateFilter === "month") {
      start.setMonth(start.getMonth() - 1);
    } else if (dateFilter === "year") {
      start.setFullYear(start.getFullYear() - 1);
    }

    const resolution = resolutionFilter === "all" ? null : resolutionFilter;

    const params = {
      start: start ? start.toISOString() : null,
      resolution
    };

    const paramString = Object.keys(params)
      .filter(key => params[key])
      .map(key => `${key}=${params[key]}`)
      .join("&");

    return `${url}?${paramString}`;
  },

  setOamMosaicLayer: function(dateFilter, resolutionFilter) {
    this.oamMosaicLayer = L.tileLayer(
      this.getMosaicLayerUrl(dateFilter, resolutionFilter)
    );
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function() {
    this.map = L.mapbox.map(this.refs.mapContainer, null, {
      zoomControl: false,
      minZoom: config.map.minZoom,
      maxZoom: config.map.maxZoom,
      maxBounds: L.latLngBounds([-90, -210], [90, 210]),
      attributionControl: false
    });

    if (config.map.oamMosaicLayer) {
      // set the new mosaic layer to oamMosaicLayer property
      this.setOamMosaicLayer(
        this.props.filterParams.date,
        this.props.filterParams.resolution
      );
    }

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
    mapIssueTrigger.addEventListener("click", this.onMapIssueReport);

    // Custom zoom control.
    var zoomCtrl = new DSZoom({
      position: "bottomright",
      containerClasses: "zoom-controls",
      zoomInClasses: "button-zoom button-zoom--in",
      zoomOutClasses: "button-zoom button-zoom--out"
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

    this.mapGridLayer.on("mouseover", this.onGridSqrOver);
    this.mapGridLayer.on("mouseout", this.onGridSqrOut);
    this.mapGridLayer.on("click", this.onGridSqrClick);

    // Map position from path.
    var mapString = this.stringToMapView(this.props.map.view);
    var view = [mapString.lat, mapString.lng];
    var zoom = mapString.zoom;
    this.map.setView(view, zoom);

    this.map.on("moveend", this.onMapMoveend);
    // Ensure there's always a coordinate in the URI
    if (!this.props.params.map) this.onMapMoveend();

    this.updateGrid();
    this.updateSelectedSquare();
    utils.delayedMapContainerResize(this.map);
  },

  addMosaicLayer: function() {
    if (!this.oamMosaicLayer || this.map.hasLayer(this.oamMosaicLayer)) return;
    this.map.addLayer(this.oamMosaicLayer);
  },

  removeMosaicLayer: function() {
    if (!this.oamMosaicLayer || !this.map.hasLayer(this.oamMosaicLayer)) return;
    this.map.removeLayer(this.oamMosaicLayer);
  },

  // Lifecycle method.
  // Called when the component gets updated.
  componentDidUpdate: function(prevProps, prevState) {
    // Is there a need to update the map view.
    if (this.requireMapViewUpdate) {
      var routerMap = this.stringToMapView(this.props.map.view);
      this.map.setView([routerMap.lat, routerMap.lng], routerMap.zoom);
    }
    this.updateGrid();
    this.updateSelectedSquare();

    if (this.requireSelectedItemUpdate) {
      this.updateSelectedItemImageFootprint({ type: "thumbnail" });
    }

    // Ensure there's always a coordinate in the URI
    if (!this.props.params.map) this.onMapMoveend();

    const isFiltersChanged = Object.keys(this.props.filterParams).some(
      item =>
        item !== "dataType" &&
        this.props.filterParams[item] !== prevProps.filterParams[item]
    );

    if (isFiltersChanged) {
      this.removeMosaicLayer(); // remove previous mosaic layer

      // set the new mosaic layer to oamMosaicLayer property
      this.setOamMosaicLayer(
        this.props.filterParams.date,
        this.props.filterParams.resolution
      );
    }

    if (
      !this.mapOverImageLayer || // if we don't have a selected image layer
      isFiltersChanged // or filters have changed
    )
      this.addMosaicLayer(); // then show the mosaic
    else this.removeMosaicLayer(); // otherwise hide it
  },

  componentWillUnmount: function() {
    let mapIssueTrigger = this.refs.mapContainer.querySelector(
      '[data-hook="map:issue"]'
    );
    mapIssueTrigger.removeEventListener("click", this.onMapIssueReport);

    // On non-map pages that are navigated to after having viewed the map, then
    // there could be weird behaviour where this `moveend` event was still
    // listening. So for instance a browser resize on say the `/upload` page
    // would trigger a redirect to the map so it could be recentered! This was a
    // difficult bug to discover.
    this.map.removeEventListener("moveend");
  },

  // Lifecycle method.
  render: function() {
    // TODO: Styling here is a hack, try upgrading mapbox.js
    return <div id="map" ref="mapContainer" style={{ position: "fixed" }} />;
  },

  onMapIssueReport: function(e) {
    e.preventDefault();
    actions.openModal("feedback");
  },

  // Update the URI when the map view changes.
  // The debounce here is not ideal. It is a fix to overcome a side effect where a feedback
  // loop occurs. It would be better to find the cause of the feedback loop.
  onMapMoveend: function(e) {
    if (this.canMoveMap) {
      utils.pushURI(this.props, { map: this.mapViewToString() });
      this.canMoveMap = false;
      setTimeout(() => {
        this.canMoveMap = true;
      }, 300);
    }
  },

  // Map event
  onGridSqrOver: function(e) {
    // On mouseover add gs-highlight.
    if (!this.getSqrQuadKey() && e.layer.feature.properties.count > 0) {
      L.DomUtil.addClass(e.layer._path, "gs-highlight");
      // Open popup on square center.
      var sqrCenter = centroid(e.layer.feature).geometry.coordinates;
      e.layer.openPopup([sqrCenter[1], sqrCenter[0]]);
    }
  },

  // Map event
  onGridSqrOut: function(e) {
    // On mouseover remove gs-highlight.
    L.DomUtil.removeClass(e.layer._path, "gs-highlight");
    e.layer.closePopup();
  },

  // Map event
  onGridSqrClick: function(e) {
    // Ensure that the popup doesn't open.
    e.layer.closePopup();

    if (this.props.selectedSquareQuadkey) {
      // There is a square selected. Unselect.
      utils.pushURI(this.props, {
        square: null
      });
    } else if (e.layer.feature.properties.count) {
      var quadKey = e.layer.feature.properties._quadKey;
      var z = Math.round(this.map.getZoom());
      var squareCenter = centroid(e.layer.feature).geometry.coordinates;
      var mapView = utils.getMapViewString(squareCenter[0], squareCenter[1], z);
      utils.pushURI(this.props, {
        map: mapView,
        square: quadKey,
        image: null
      });
    }
  },

  // Actions listener.
  onFitToBounds: function(bounds) {
    if (bounds) {
      this.map.fitBounds(bounds);
      this.onMapMoveend();
    }
  },

  // Actions listener.
  onMoveToCoords: function(coords) {
    const center = [coords[1], coords[0]];
    const zoom = 16;
    this.map.setView(center, zoom);
    this.onMapMoveend();
  },

  // Actions listener.
  onChangeBaseLayer: function() {
    let layer = mapStore.getBaseLayer();
    this.refs.mapContainer.className = this.refs.mapContainer.className.replace(
      /\bbase-layer--\S*/,
      ""
    );
    this.refs.mapContainer.classList.add(`base-layer--${layer.id}`);
    if (this.baseLayer) {
      this.map.removeLayer(this.baseLayer);
    }
    this.baseLayer = L.tileLayer(layer.url);
    this.baseLayer.addTo(this.map).bringToBack();
  },

  // Actions listener.
  onRequestMyLocation: function() {
    navigator.geolocation.getCurrentPosition(
      position => {
        let { longitude, latitude } = position.coords;
        let mapView = utils.getMapViewString(longitude, latitude, 15);
        utils.pushURI(this.props, {
          map: mapView
        });
      },
      err => {
        console.warn("my location error", err);
      }
    );
  },

  // Action listener for when mouse enters a result in the results modal
  onResultOver: function(feature) {
    var f = utils.getPolygonFeature(feature.geojson.coordinates);
    this.mapOverFootprintLayer.clearLayers().addData(f);
    this.mapOverFootprintLayer.eachLayer(function(l) {
      L.DomUtil.addClass(l._path, "g-footprint");
    });
  },

  // Action listener for when the mouse leaves a result in the results modal
  onResultOut: function() {
    this.mapOverFootprintLayer.clearLayers();
  },

  // Action listener for when a result in the results modal is clicked
  onResultSelected: function(result) {
    this.onResultOut();
    utils.pushURI(this.props, {
      image: result.data._id
    });
  },

  updateGrid: function() {
    var _this = this;
    this.mapGridLayer.clearLayers();

    // Don't show the grid if an image is selected. This actually originally
    // derives from the difficulty of displaying a `tileLayer` over `geoJson`.
    // The documented methods of temporal ordering and zIndex values do not
    // seem to work.
    if (this.props.params.image_id) return;

    // Recompute grid based on current map view (bounds + zoom).
    var bounds = this.map
      .getBounds()
      .toBBoxString()
      .split(",")
      .map(Number);
    var gridData = this.computeGrid(this.map.getZoom(), bounds);

    // Stick a 'count' property onto each grid square, based on the number of
    // footprints that intersect with the square.
    gridData.features.forEach(function(gridSquare) {
      var featureCenter = centroid(gridSquare);
      // The footprints with bboxes that intersect with this grid square.
      // Get all the footprints inside the current square.
      var foots = mapStore.getFootprintsInSquare(gridSquare);
      // Filter with whatever filters are set.
      foots = foots
        .filter(function(foot) {
          var filter = _this.props.filterParams;
          var prop = foot.feature.properties;

          // Data type.
          if (filter.dataType !== "all" && !prop.tms) {
            return false;
          }

          // Resolution.
          switch (filter.resolution) {
            // >=5
            case "low":
              if (prop.gsd < 5) {
                return false;
              }
              break;
            // <5 && >=1
            case "medium":
              if (prop.gsd >= 5 || prop.gsd < 1) {
                return false;
              }
              break;
            // < 1
            case "high":
              if (prop.gsd >= 1) {
                return false;
              }
              break;
            default:
            // Let all imagery of any resolution through to be tested against
            // the filters below.
          }

          // Date.
          if (filter.date !== "all") {
            var d = new Date();
            if (filter.date === "week") {
              d.setDate(d.getDate() - 7);
            } else if (filter.date === "month") {
              d.setMonth(d.getMonth() - 1);
            } else if (filter.date === "year") {
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
        .filter(function(foot) {
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
    this.mapGridLayer.eachLayer(function(l) {
      var elClasses = ["gs"];

      // Is there a square selected?
      // When there is a square selected, gs-inactive to everything.
      if (_this.getSqrQuadKey()) {
        elClasses.push("gs-inactive");
      } else {
        // Gradation.
        if (l.feature.properties.count >= 50) {
          elClasses.push("gs-density-high");
        } else if (l.feature.properties.count >= 20) {
          elClasses.push("gs-density-medhigh");
        } else if (l.feature.properties.count >= 5) {
          elClasses.push("gs-density-med");
        } else if (l.feature.properties.count > 0) {
          elClasses.push("gs-density-low");
        }
      }

      // Add all classes.
      L.DomUtil.addClass(l._path, elClasses.join(" "));

      var p = L.popup({
        autoPan: false,
        closeButton: false,
        offset: L.point(0, 10),
        className: "gs-tooltip-count"
      }).setContent(l.feature.properties.count.toString());

      l.bindPopup(p);
    });
  },

  updateSelectedSquare: function() {
    // Clear the selected square layer.
    this.mapSelectedSquareLayer.clearLayers();
    // If there is a selected square add it to its own layer.
    // In this way we can scale the grid without touching the selected square.
    if (this.getSqrQuadKey() && !this.disableSelectedSquare) {
      var qk = this.getSqrQuadKey();
      var coords = utils.coordsFromQuadkey(qk);
      var f = utils.getPolygonFeature(coords);

      this.mapSelectedSquareLayer.addData(f).eachLayer(function(l) {
        L.DomUtil.addClass(l._path, "gs-active gs");
      });
    }
  },

  // When zoomed in to a layer that accepts high zoom levels and that
  // layer is removed, we need to zoom back out to the default max
  // zoom, but still remain centred on the same coord.
  correctOverZoom: function() {
    this.map.options.maxZoom = config.map.maxZoom;
    if (this.map.getZoom() > config.map.maxZoom) {
      this.map.setZoom(config.map.maxZoom);
      this.onMapMoveend();
    }
  },

  // When changing between TMS/Thumbnail preview
  updateSelectedItemImageFootprint: function(previewOptions) {
    this.disableSelectedSquare = false;
    if (this.map.hasLayer(this.mapOverImageLayer)) {
      this.map.removeLayer(this.mapOverImageLayer);
      this.mapOverImageLayer = null;
      this.correctOverZoom();
    }
    if (this.props.selectedItem) {
      var item = this.props.selectedItem;
      if (previewOptions.type === "tms") {
        // We can preview the main tms and the custom ones as well.
        // When previewing the main tms the index property won't be set.
        // We're not doing any validation here because the action call is
        // controlled.
        let tmsUrl =
          previewOptions.index === undefined
            ? item.properties.tms
            : item.custom_tms[previewOptions.index];
        tmsUrl = tmsUrl.replace("{zoom}", "{z}");

        this.disableSelectedSquare = true;

        const layerUrl = config.useTitiler ? item.properties.tilejson : tmsUrl;
        this.getLayerMaxZoom(layerUrl).then(data => {
          this.map.options.maxZoom = data.maxzoom;
          this.mapOverImageLayer = L.tileLayer(tmsUrl, {
            maxZoom: this.map.options.maxZoom
          });
          this.map.addLayer(this.mapOverImageLayer);
          this.updateSelectedSquare();
        });
      } else if (previewOptions.type === "thumbnail") {
        var imageBounds = [
          [item.bbox[1], item.bbox[0]],
          [item.bbox[3], item.bbox[2]]
        ];
        this.mapOverImageLayer = L.imageOverlay(
          item.properties.thumbnail,
          imageBounds
        );
        this.map.addLayer(this.mapOverImageLayer);
        this.updateSelectedSquare();
      }
    }
  },

  // Mapbox.js doesn't seem to account for the new zoom levels when adding a layer.
  // So we need to fetch the tilejSON data over HTTP, parse it for the max zoom,
  // then apply it both to the map to adjust the zoom controls and the layer to make
  // it trigger the relevant HTTP tiling requests for zoom levels above the default
  // 18.
  // TODO: Add layer's tileJSON, or relevant portions thereof, to oin-meta-generator.
  //       This will prevent the need for;
  //       1. Hacking the `tms` field to get the base tileJSON URI.
  getLayerMaxZoom: function(tmsURI) {
    const tileJSONURI = config.useTitiler
      ? tmsURI
      : tmsURI
          .replace(/\/\{z\}\/\{x\}\/\{y\}.*/, "/")
          .replace("http://", "https://");
    return fetch(tileJSONURI).then(response => {
      if (!response.ok)
        return Promise.reject(new Error(`HTTP Error ${response.status}`));
      return response.json();
    });
  },

  // Helper functions

  getSqrQuadKey: function() {
    return this.props.selectedSquareQuadkey;
  },

  /**
   * Build a grid for the given zoom level, within the given bbox
   *
   * @param {number} zoom
   * @param {Array} bounds [minx, miny, maxx, maxy]
   */
  computeGrid: function(zoom, bounds) {
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
          type: "Feature",
          properties: {
            _quadKey: tilebelt.tileToQuadkey(tile),
            id: boxes.length,
            tile: tile.join("/")
          },
          geometry: tilebelt.tileToGeoJSON(tile)
        };
        boxes.push(feature);
      }
    }
    return {
      type: "FeatureCollection",
      features: boxes
    };
  },

  // Converts the map view (coords + zoom) to use on the path.
  mapViewToString: function() {
    var center = this.map.getCenter();
    var zoom = Math.round(this.map.getZoom());
    return utils.getMapViewString(center.lng, center.lat, zoom);
  },

  // Converts a path string like 60.359564131824214,4.010009765624999,6
  // to a readable object.
  stringToMapView: function(string) {
    var data = string.split(",");
    return {
      lng: data[0],
      lat: data[1],
      zoom: data[2]
    };
  }
});
