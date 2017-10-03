import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import _ from "lodash";

import MapBoxMap from "components/map";
import MiniMap from "components/minimap";
import ResultsPane from "components/results_pane";
import mapStore from "stores/map_store";
import searchQueryStore from "stores/search_query_store";
import cookie from "utils/cookie";
import utils from "utils/utils";
import actions from "actions/actions";
import config from "config";

export default createReactClass({
  displayName: "Home",

  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  mixins: [
    Reflux.listenTo(searchQueryStore, "onSearchQueryChanged"),
    Reflux.listenTo(mapStore, "loadImagery")
  ],

  getInitialState: function() {
    return {
      results: [],
      map: {
        view: null
      },
      selectedSquareQuadkey: null,
      selectedItemId: null,
      filterParams: searchQueryStore.getParameters()
    };
  },

  getImagery: function() {
    if (this.props.params.square_id) {
      return mapStore.getSquareResults();
    }
    if (this.props.params.user_id) {
      return mapStore.getUserImagery();
    }
    return mapStore.getLatestImagery();
  },

  loadImagery: function(_what) {
    this.setState({ results: this.getImagery() });
  },

  // Action listener
  onSearchQueryChanged: function(params) {
    this.setState({ filterParams: params });
  },

  componentWillMount: function() {
    var state = _.cloneDeep(this.state);

    // The map parameters form the url take precedence over everything else
    // if they're not present try the cookie.
    state.map.view = this.getMapViewOrDefault(this.props.params.map);

    state.selectedSquareQuadkey = this.props.params.square_id;
    state.selectedItemId = this.props.params.image_id;

    if (this.props.params.user_id) {
      mapStore.queryUserImagery(this.props.params.user_id);
    }

    state.results = this.getImagery();
    this.setState(state);
  },

  componentWillReceiveProps: function(nextProps) {
    var state = _.cloneDeep(this.state);

    // Map view.
    var nextMapView = this.getMapViewOrDefault(nextProps.params.map);
    if (this.getMapViewOrDefault(this.props.params.map) !== nextMapView) {
      state.map.view = nextMapView;
      // Map view changed. Store cookie.
      cookie.create("oam-map-view", state.map.view.replace(/,/g, "|"));
    }

    // Selected Square
    if (this.props.params.square_id !== nextProps.params.square_id) {
      state.selectedSquareQuadkey = nextProps.params.square_id;
      if (state.selectedSquareQuadkey) {
        var bbox = utils.tileBboxFromQuadkey(state.selectedSquareQuadkey);
        actions.selectedBbox(bbox);
      }
    }

    if (this.props.params.user_id !== nextProps.params.user_id) {
      if (nextProps.params.user_id)
        mapStore.queryUserImagery(nextProps.params.user_id);
    }

    // Selected image
    if (this.props.params.image_id !== nextProps.params.image_id) {
      state.selectedItemId = nextProps.params.image_id;
    }

    if (!nextProps.params.user_id && !nextProps.params.image_id) {
      mapStore.queryLatestImagery();
    }

    state.results = this.getImagery();
    this.setState(state);
  },

  componentDidMount: function() {
    if (this.state.selectedSquareQuadkey) {
      var bbox = utils.tileBboxFromQuadkey(this.state.selectedSquareQuadkey);
      actions.selectedBbox(bbox);
    }
  },

  render: function() {
    var selectedItem = _.find(this.state.results, {
      _id: this.state.selectedItemId
    });

    return (
      <div>
        <div className="sidebar-content">
          {this.state.results.length ? (
            <ResultsPane
              query={this.props.query}
              params={this.props.params}
              map={this.state.map}
              results={this.state.results}
              selectedItemId={this.state.selectedItemId}
              selectedSquareQuadkey={this.state.selectedSquareQuadkey}
            />
          ) : (
            "Loading imagery ..."
          )}
        </div>

        <MapBoxMap
          query={this.props.query}
          params={this.props.params}
          map={this.state.map}
          selectedSquareQuadkey={this.state.selectedSquareQuadkey}
          selectedItemId={this.state.selectedItemId}
          selectedItem={selectedItem}
          filterParams={this.state.filterParams}
        />

        <MiniMap
          query={this.props.query}
          selectedSquare={this.props.params.square}
          selectedSquareQuadkey={this.state.selectedSquareQuadkey}
          selectedItemId={this.state.selectedItemId}
          map={this.state.map}
        />
      </div>
    );
  },

  /**
   * Returns the mapView if valid or the default one.
   * @param  mapView
   *
   * @return mapView
   */
  getMapViewOrDefault: function(mapView) {
    if (!this.isMapViewValid(mapView)) {
      var cookieView = cookie.read("oam-map-view");
      if (cookieView !== "undefined" && cookieView !== null) {
        mapView = cookie.read("oam-map-view").replace(/\|/g, ",");
      } else {
        mapView = config.map.initialView
          .concat(config.map.initialZoom)
          .join(",");
        // Let's correct the cookie value.
        cookie.create("oam-map-view", mapView.replace(/,/g, "|"));
      }
    }
    return mapView;
  },

  // The router path for the map view is defined on the route like `/:mapview`.
  // So we don't have a 404, we can only check if the URL looks like a map view.
  // TODO: Return an actual 404 page.
  isMapViewValid: function(mapView) {
    if (typeof mapView !== "string") return;
    return mapView.split(",").length === 3;
  }
});
