import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";

import actions from "actions/actions";
import Filters from "components/filters";
import utils from "utils/utils";

import userStore from "stores/user_store";
import MapLayers from "components/map-layers";
import MainMenu from "components/main_menu";
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
      isUserLoggedIn: userStore.isLoggedIn()
    });
  },

  feedbackClickHandler: function(e) {
    e.preventDefault();
    actions.openModal("feedback");
  },

  isMap: function() {
    return utils.isOnMainMap(this.props);
  },

  render: function() {
    return (
      <header className="main-header" role="banner">
        <div className="main-header-wrapper">
          <a className="main-logo" href="#/" title="Home">
            <img src={logo} alt="OpenAerialMap logo" />
          </a>

          {this.isMap() ? (
            <nav className="page__prime-nav">
              <div className="nav-block-prime">
                <SearchBox />
                <ul className="app-menu">
                  <li className="bttn menu-filters">
                    <Filters
                      params={this.props.params}
                      query={this.props.query}
                    />
                  </li>
                  <li className="bttn map-control-layers">
                    <MapLayers />
                  </li>
                </ul>
              </div>
            </nav>
          ) : null}
          <MainMenu />
        </div>
      </header>
    );
  }
});
