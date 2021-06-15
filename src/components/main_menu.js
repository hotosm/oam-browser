import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";

import MenuIcon from "mdi-react/MenuIcon";
import UploadIcon from "mdi-react/UploadIcon";

import actions from "actions/actions";
import Dropdown from "oam-design-system/dropdown";
import userStore from "stores/user_store";

import Status from "components/oam-status";

export default createReactClass({
  displayName: "MainMenu",

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

  onLoginClick: function() {
    actions.openModal("login");
  },

  render: function() {
    return (
      <ul className="main-menu">
        {this.state.isUserLoggedIn ? (
          <li className="bttn bttn-icon bttn-info">
            <a href="#/upload" title="Go to OAM Uploader">
              <span>Upload</span>
              <UploadIcon />
            </a>
          </li>
        ) : (
          <li className="bttn menu-signin-upload">
            <a onClick={this.onLoginClick} title="Sign In">
              <span>Sign In</span>
            </a>
          </li>
        )}

        <li className="menu-profile_pic">
          {this.state.isUserLoggedIn ? (
            <a href="#/account">
              <div className="profile-pic-wrapper">
                <img src={this.state.user.profile_pic_uri} alt="Profile" />
              </div>
            </a>
          ) : null}
        </li>
        <li className="bttn menu-dropdown">
          <MenuIcon />
          <Dropdown
            triggerElement="a"
            triggerClassName="menu_dropdown_button"
            triggerText=""
            direction="down"
            alignment="right"
          >
            {this.state.isUserLoggedIn ? (
              <ul className="drop__menu info-menu" role="menu">
                <li>
                  <a
                    href="#/account"
                    className="drop__menu-item"
                    data-hook="dropdown:close"
                  >
                    <span>My Account</span>{" "}
                    <small>{this.state.user.name}</small>
                  </a>
                </li>
                <li>
                  <a
                    className="drop__menu-item"
                    onClick={actions.userLogOut}
                    data-hook="dropdown:close"
                  >
                    <span>Logout</span>
                  </a>
                </li>
              </ul>
            ) : null}
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
                  href="mailto:info@openaerialmap.org"
                  title="Get in touch"
                >
                  <span>Contact</span> <small>info@openaerialmap.org</small>
                </a>
              </li>
            </ul>
            <ul className="drop__menu info-menu" role="menu">
              <li>
                <Status />
              </li>
            </ul>
          </Dropdown>
        </li>
      </ul>
    );
  }
});
