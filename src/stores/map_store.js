import qs from "querystring";
import Reflux from "reflux";
import _ from "lodash";
import extent from "turf-extent";
import rbush from "rbush";

import actions from "actions/actions";
import searchQueryStore from "stores/search_query_store";
import api from "utils/api";
import config from "../config";

const baseLayers = config.map.baseLayers;

export default Reflux.createStore({
  storage: {
    prevSearchParams: "",
    squareResults: [],
    latestImagery: [],
    userImagery: [],
    imageryOwner: {},
    sqrSelected: null,
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

  // TODO: Is this necessary? Can we not just make the single API requests for
  //       footprints and scim the latest image from that API request?
  queryLatestImagery: function() {
    api({
      uri: "/meta?order_by=acquisition_end&sort=desc&limit=10"
    }).then(data => {
      this.storage.latestImagery = data.results;
      this.trigger("latest-imagery");
    });
  },

  queryUserImagery: function(user_id) {
    api({
      uri: `/user/${user_id}`
    }).then(data => {
      this.storage.imageryOwner = data.results;
      this.storage.userImagery = data.results.images;
      this.trigger("user-imagery");
    });
  },

  // TODO: Need to watch out here that the API response doesn't become
  //       problematically large.
  queryFootprints: function() {
    api({ uri: "/meta?limit=99999" }).then(data => {
      var footprintsFeature = this.parseFootprints(data.results);
      var tree = rbush(9);
      tree.load(
        footprintsFeature.features.map(function(feat) {
          var item = feat.geometry.bbox;
          item.feature = feat;
          return item;
        })
      );
      this.storage.footprintsTree = tree;
      this.trigger("footprints");
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

  footprintsWereFetched: function() {
    return this.storage.footprintsTree === null;
  },

  /**
   * Translate the application-based search parameters into terms that the
   * API understands, then hit the API and broadcast the result.
   */
  queryData: function() {
    var parameters = searchQueryStore.getParameters();

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
      this.trigger("square-results");
      return;
    }
    this.storage.prevSearchParams = strParams;

    api({ uri: `/meta?${strParams}` }).then(data => {
      this.storage.squareResults = data.results;
      this.trigger("square-results");
    });
  },

  // Actions listener.
  onSelectedBbox: function(bbox) {
    this.storage.selectedBbox = bbox;
    this.queryData();
  },

  // Return the latest images that has been uploaded by all users.
  getLatestImagery: function() {
    return this.storage.latestImagery;
  },

  // Return the users associated with a specific user.
  getUserImagery: function() {
    return this.storage.userImagery;
  },

  // Return the user details for current imagery list owner.
  getImageryOwner: function() {
    return this.storage.imageryOwner;
  },

  // Returns the stored results, such as from clicking on a grid.
  getSquareResults: function() {
    return this.storage.squareResults;
  },

  // Returns the base layer currently selected.
  getBaseLayer: function() {
    return this.storage.baseLayer;
  }
});
