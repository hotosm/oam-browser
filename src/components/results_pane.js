import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import _ from "lodash";

import mapStore from "stores/map_store";
import ResultsList from "components/results_list";
import ResultsItem from "components/results_item";

import logo from "images/oam-logo-h-pos.svg";

export default createReactClass({
  displayName: "ResultsPane",

  propTypes: {
    query: PropTypes.object,
    params: PropTypes.object,
    map: PropTypes.object,
    results: PropTypes.array,
    selectedItemId: PropTypes.string,
    selectedSquareQuadkey: PropTypes.string
  },

  setupCurrentImage: function() {
    if (this.props.selectedItemId) {
      this.currentIndex = _.findIndex(this.props.results, i => {
        return (
          i._id === this.props.selectedItemId ||
          i.uuid.includes(this.props.selectedItemId)
        );
      });
      this.currentResult = this.props.results[this.currentIndex];
    } else {
      this.currentResult = null;
    }
  },

  // The user may not be nested in the image object, say for displaying
  // all the images for a particular user - in which case the images
  // themselves are nested in the user object. So here we decide where to
  // get the actual user data from.
  getUserForImage: function(image) {
    var listOwner = {};
    if (this.props.params.user_id) {
      listOwner = mapStore.getImageryOwner();
    }
    var isUserObjectInImage = typeof image.user === "object";
    return isUserObjectInImage ? image.user : listOwner;
  },

  render: function() {
    var resultsPane = null;
    if (this.props.selectedItemId && this.props.results.length) {
      this.setupCurrentImage();
      var pg = {
        total: this.props.results.length,
        current: this.currentIndex + 1,
        prevId:
          this.currentIndex > 0
            ? this.props.results[this.currentIndex - 1]._id
            : null,
        nextId:
          this.currentIndex < this.props.results.length - 1
            ? this.props.results[this.currentIndex + 1]._id
            : null
      };
      resultsPane = (
        <ResultsItem
          query={this.props.query}
          params={this.props.params}
          map={this.props.map}
          selectedSquareQuadkey={this.props.selectedSquareQuadkey}
          data={this.currentResult}
          user={this.getUserForImage(this.currentResult)}
          pagination={pg}
        />
      );
    } else {
      resultsPane = (
        <ResultsList
          query={this.props.query}
          params={this.props.params}
          map={this.props.map}
          selectedSquareQuadkey={this.props.selectedSquareQuadkey}
          results={this.props.results}
        />
      );
    }
    return (
      <div id="results-pane" className="pane">
        <a className="main-logo main-logo-map" href="#/" title="Home">
          <img src={logo} alt="OpenAerialMap logo" />
        </a>
        {resultsPane}
      </div>
    );
  }
});
