import qs from "querystring";
import Reflux from "reflux";
import _ from "lodash";
import $ from "jquery";
import extent from "turf-extent";
import rbush from "rbush";

import actions from "../actions/actions";
import searchQueryStore from "./search_query_store";
import config from "../config";
import baseLayers from "../utils/map-layers";

export default Reflux.createStore({
  storage: {
    prevSearchParams: "",
    results: [],
    sqrSelected: null,
    latestImagery: null,
    footprintsTree: null,
    baseLayer: baseLayers[0]
  },

  // Called on creation.
  // Setup listeners.
  init: function() {
    this.listenTo(actions.selectedBbox, this.onSelectedBbox);
    this.listenTo(actions.setBaseLayer, this.onSetBaseLayer);
    this.queryLatestImagery();
    this.queryFootprints();
  },

  onSetBaseLayer: function(layer) {
    this.storage.baseLayer = layer;
  },

  queryLatestImagery: function() {
    var _this = this;

    $.get(
      config.catalog.url + "/meta?order_by=acquisition_end&sort=desc&limit=1"
    ).success(function(data) {
      _this.storage.latestImagery = data.results[0];
      actions.latestImageryLoaded();
    });
  },

  queryFootprints: function() {
    var _this = this;

    $.get(config.catalog.url + "/meta?limit=99999").success(function(data) {
      var footprintsFeature = _this.parseFootprints(data.results);

      var tree = rbush(9);
      tree.load(
        footprintsFeature.features.map(function(feat) {
          var item = feat.geometry.bbox;
          item.feature = feat;
          return item;
        })
      );
      _this.storage.footprintsTree = tree;
      _this.trigger("footprints");
    });
  },

  parseFootprints: function(results) {
    var fc = {
      type: "FeatureCollection",
      features: []
    };
    var id = 0;
    _.each(results, function(foot) {
      fc.features.push({
        type: "Feature",
        properties: {
          gsd: foot.gsd,
          tms: !!foot.properties.tms || !!foot.custom_tms,
          acquisition_end: foot.acquisition_end,
          FID: id++
        },
        geometry: foot.geojson
      });
    });
    return fc;
  },

  getFootprintsInSquare: function(sqrFeature) {
    if (!this.storage.footprintsTree) {
      return [];
    }
    return this.storage.footprintsTree.search(extent(sqrFeature));
  },

  footprintsWereFecthed: function() {
    return this.storage.footprintsTree === null;
  },

  /**
   * Translate the application-based search parameters into terms that the
   * API understands, then hit the API and broadcast the result.
   */
  queryData: function() {
    var parameters = searchQueryStore.getParameters();
    var _this = this;

    // hit API and broadcast result
    var resolutionFilter = {
      all: {},
      low: { gsd_from: 5 }, // 5 +
      medium: { gsd_from: 1, gsd_to: 5 }, // 1 - 5
      high: { gsd_to: 1 } // 1
    }[parameters.resolution];

    var d = new Date();
    if (parameters.date === "week") {
      d.setDate(d.getDate() - 7);
    } else if (parameters.date === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (parameters.date === "year") {
      d.setFullYear(d.getFullYear() - 1);
    }

    var dateFilter =
      parameters.date === "all"
        ? {}
        : {
            acquisition_from: [
              d.getFullYear(),
              d.getMonth() + 1,
              d.getDate()
            ].join("-")
          };

    var typeFilter = parameters.dataType === "all" ? {} : { has_tiled: true };

    // Calculate bbox;
    var bbox = this.storage.selectedBbox.join(",");

    var params = _.assign(
      {
        limit: 4000,
        bbox: bbox
      },
      resolutionFilter,
      dateFilter,
      typeFilter
    );

    var strParams = qs.stringify(params);
    if (strParams === this.storage.prevSearchParams) {
      _this.trigger("squareData");
      return;
    }
    this.storage.prevSearchParams = strParams;

    $.get(config.catalog.url + "/meta?" + strParams).success(function(data) {
      _this.storage.results = data.results;
      _this.trigger("squareData");
    });
  },

  // Actions listener.
  onSelectedBbox: function(bbox) {
    this.storage.selectedBbox = bbox;
    this.queryData();
  },

  /**
   * Returns the latest imagery's coordinates.
   * @return Feature or null
   */
  getLatestImagery: function() {
    return this.storage.latestImagery;
  },

  /**
   * Returns the stored results.
   * @return Array or null
   */
  getResults: function() {
    return this.storage.results;
  },

  /**
   * Returns the base layer currently selected.
   * @return Object
   */
  getBaseLayer: function() {
    return this.storage.baseLayer;
  }
});
