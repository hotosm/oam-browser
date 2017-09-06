import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import { hashHistory } from "react-router";
import centroid from "turf-centroid";
import Dropdown from "oam-design-system/dropdown";

import actions from "actions/actions";
import Filters from "components/filters";
import utils from "utils/utils";
import User from "utils/user";
import config from "config";
import mapStore from "stores/map_store";
import userStore from "stores/user_store";
import MapLayers from "components/map-layers";
import SearchBox from "components/search_box";

import logo from "images/oam-logo-h-pos.svg";

export default createReactClass({
  displayName: "Header",

  propTypes: {
    query: PropTypes.object,
    routes: PropTypes.array,
    location: PropTypes.object,
    params: PropTypes.object
  },

  mixins: [Reflux.listenTo(userStore, "onUserStoreData")],

  getInitialState: function() {
    return {
      oamHealth: null
    };
  },

  // TODO:
  //   Refactor common user code into a decorator so that any component can be
  //   simply augmented to include the relevant user functions/listenerers, etc.
  //   Eg;
  //     https://auth0.com/blog/adding-authentication-to-your-react-flux-app/
  //     https://github.com/adambene/react-authenticate/blob/master/src/authenticate.js
  onUserStoreData: function(_triggered) {
    this.setState({
      user: userStore.storage.user,
      userLoggedIn: userStore.isLoggedIn()
    });
  },

  fetchOAMHealth: function() {
    fetch(config.oamStatus)
      .then(response => {
        if (!response.ok)
          return Promise.reject(new Error(`HTTP Error ${response.status}`));
        return response.json();
      })
      .then(data => {
        this.setState({
          oamHealth: data.health
        });
      });
  },

  feedbackClickHandler: function(e) {
    e.preventDefault();
    actions.openModal("feedback");
  },

  componentWillMount: function() {
    User.setup();
  },

  componentDidMount: function() {
    this.fetchOAMHealth();
  },

  onBrowseLatestClick: function(e) {
    e.preventDefault();
    var previewZoom = 10;
    var latest = mapStore.getLatestImagery();
    var f = {
      type: "Feature",
      geometry: latest.geojson
    };
    var center = centroid(f).geometry.coordinates;
    var quadKey = utils.quadkeyFromCoords(center[0], center[1], previewZoom);
    var mapView = center[0] + "," + center[1] + "," + previewZoom;

    hashHistory.push(`/${mapView}/${quadKey}/${latest._id}`);
  },

  isMap: function() {
    return utils.isOnMainMap(this.props);
  },

  render: function() {
    var oamHealthClass = "drop__menu-item status-item ";
    switch (this.state.oamHealth) {
      case "green":
        oamHealthClass += "status-item--up";
        break;
      case "yellow":
        oamHealthClass += "status-item--meh";
        break;
      case "red":
        oamHealthClass += "status-item--down";
        break;
      default:
        oamHealthClass += "status-item--unknown";
    }

    return (
      <header className="page__header" role="banner">
        <div className="inner">
          <div className="page__headline">
            <h1 className="page__title">
              <span className="mast-logo mast-logo--h">
                <a href="#/" title="Home">
                  <img
                    className="mast-logo__image"
                    src={logo}
                    width="832"
                    height="160"
                    alt="OpenAerialMap logo"
                  />
                  <strong className="mast-logo__text">OpenAerialMap</strong>
                  <small className="mast-logo__label">Browser</small>
                </a>
              </span>
            </h1>
          </div>

          <nav className="page__prime-nav">
            {this.isMap()
              ? <div className="nav-block-prime">
                  <SearchBox />
                  <ul className="app-menu">
                    <li>
                      <Filters
                        params={this.props.params}
                        query={this.props.query}
                      />
                    </li>
                    <li>
                      <a
                        onClick={this.onBrowseLatestClick}
                        className="button-latest"
                        title="Go to the latest imagery"
                      >
                        <span>Latest imagery</span>
                      </a>
                    </li>
                    <li className="map-layers">
                      <MapLayers />
                    </li>
                  </ul>
                </div>
              : null}
            <div className="nav-block-sec">
              <ul className="meta-menu">
                <li>
                  {this.state.userLoggedIn
                    ? <div>
                        <img
                          className="profile_pic"
                          src={userStore.storage.user.profile_pic_uri}
                          alt="Profile"
                        />
                        <a href="#/account">Account</a> |&nbsp;
                        <a onClick={actions.userLogOut}>Logout</a>
                      </div>
                    : <div className="oauth-logins">
                        <a href={userStore.facebookLoginUri}>Facebook</a>{" "}
                        |&nbsp;
                        <a href={userStore.googleLoginUri}>Google</a>
                      </div>}
                </li>
                <li>
                  <a
                    href="#/upload"
                    className="button-upload"
                    title="Go to OAM Uploader"
                  >
                    <span>Upload</span>
                  </a>
                </li>
                <li>
                  <Dropdown
                    triggerElement="a"
                    triggerClassName="button-info"
                    triggerActiveClassName="button--active"
                    triggerTitle="Info"
                    triggerText="Info"
                    direction="down"
                    alignment="right"
                  >
                    <ul className="drop__menu info-menu" role="menu">
                      <li>
                        <a
                          className="drop__menu-item"
                          href="http://openaerialmap.org/about"
                          title="Learn more"
                          data-hook="dropdown:close"
                        >
                          <span>About</span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="drop__menu-item"
                          href="http://docs.openaerialmap.org/browser/getting-started/"
                          title="Go to User Guide"
                        >
                          <span>Help</span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="drop__menu-item"
                          href="#modal-feedback"
                          title="Leave feedback"
                          data-hook="dropdown:close"
                          onClick={this.feedbackClickHandler}
                        >
                          <span>Feedback</span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="drop__menu-item"
                          href="mailto:info@openaerialmap.org"
                          title="Get in touch"
                        >
                          <span>Contact</span>{" "}
                          <small>info@openaerialmap.org</small>
                        </a>
                      </li>
                    </ul>
                    <ul className="drop__menu info-menu" role="menu">
                      <li>
                        <a
                          href="https://status.openaerialmap.org/"
                          className={oamHealthClass}
                          title="Go to OAM Status"
                        >
                          <span>Status</span>
                        </a>
                      </li>
                    </ul>
                  </Dropdown>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    );
  }
});
