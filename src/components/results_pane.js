import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Keys from "react-keybinding";
import _ from "lodash";
import Dropdown from "oam-design-system/dropdown";

import mapStore from "stores/map_store";
import ResultsList from "components/results_list";
import ResultsItem from "components/results_item";
import actions from "actions/actions";
import utils from "utils/utils";

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

  mixins: [Keys],

  keybindings: {
    esc: function() {
      if (this.props.results.length === 0) {
        return;
      }
      this.closeResults();
    }
  },

  setupCurrentImage: function() {
    if (this.props.selectedItemId) {
      this.currentIndex = _.findIndex(this.props.results, {
        _id: this.props.selectedItemId
      });
      this.currentResult = this.props.results[this.currentIndex];
    } else {
      this.currentResult = null;
    }
  },

  feedbackClickHandler: function(e) {
    actions.openModal("feedback");
  },

  zoomToFit: function(e) {
    e.preventDefault();
    const bbox = this.currentResult.bbox;
    actions.fitToBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
  },

  closeResults: function(e) {
    e.preventDefault();
    utils.pushURI(this.props, {
      image: null
    });
  },

  // The user may not be nested in the image object, say for displaying
  // all the image for a particular user - in which case the images
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

  paneMenu: function() {
    return (
      <div>
        <Dropdown
          triggerElement="a"
          triggerClassName="pane-more"
          triggerActiveClassName="button--active"
          triggerTitle="More options"
          triggerText="More options"
          direction="down"
          alignment="right"
        >
          <ul className="drop__menu info-menu" role="menu">
            <li>
              <a
                className="drop__menu-item"
                href={`https://twitter.com/share?url=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                title="Share on twitter"
                data-hook="dropdown:close"
              >
                <span>Share on Twitter</span>
              </a>
            </li>

            <li>
              <a
                className="drop__menu-item"
                href={`http://facebook.com/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                title="Share on Facebook"
                data-hook="dropdown:close"
              >
                <span>Share on Facebook</span>
              </a>
            </li>
          </ul>

          <ul className="drop__menu info-menu" role="menu">
            <li>
              <a
                className="drop__menu-item"
                title="Report a problem"
                data-hook="dropdown:close"
                onClick={this.feedbackClickHandler}
              >
                <span>Report a problem</span>
              </a>
            </li>
          </ul>
        </Dropdown>

        <a
          href=""
          onClick={this.zoomToFit}
          className="pane-zoom-to-fit"
          title="Zoom to fit imagery on screen"
        >
          <span>Zoom To Fit</span>
        </a>

        <a
          href=""
          onClick={this.closeResults}
          className="pane-dismiss"
          title="Exit selection"
        >
          <span>Close</span>
        </a>
      </div>
    );
  },

  render: function() {
    var resultsPane = null;
    if (this.props.selectedItemId) {
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
        {this.props.params.image_id ? this.paneMenu() : null}
        {resultsPane}
      </div>
    );
  }
});
