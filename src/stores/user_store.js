import Reflux from "reflux";

import config from "config";
import cookie from "utils/cookie";
import { hashHistory } from "react-router";

import api from "utils/api";
import actions from "actions/actions";

export default Reflux.createStore({
  // This is a simple HTTP endpoint on the API that triggers the entire OAuth flow
  // and redirects back to the original login point with a set session cookie, if
  // everything went well.
  loginUri: function(service) {
    return (
      config.catalog.url +
      "/oauth/" +
      service +
      "?original_uri=" +
      config.OAMBrowserUrl
    );
  },

  storage: {
    // User's details, name, profile pic, etc.
    user: {}
  },

  init: function() {
    // To begin OAuth login flows
    this.facebookLoginUri = this.loginUri("facebook");
    this.googleLoginUri = this.loginUri("google");
    this.listenTo(actions.userLogIn, this.logIn);
    this.listenTo(actions.userLogOut, this.logOut);
    this.checkIfUserAlreadyLoggedIn();
  },

  checkIfUserAlreadyLoggedIn: function() {
    if (this.isLoggedIn()) {
      this.logIn();
    }
  },

  getUserDetails: function() {
    api({
      uri: "/user",
      auth: true
    }).then(response => {
      this.saveUserLocally(response.results);
      this.logIn();
    });
  },

  saveUserLocally: function(details) {
    localStorage.setItem("oam-user", JSON.stringify(details));
  },

  loadUser: function() {
    this.storage.user = JSON.parse(localStorage.getItem("oam-user"));
  },

  // The concept of being fully logged in requires both the session cookie
  // and populated user details acquired from a subsequent authenticated API
  // request. It goes without saying, though I shall say it anyway, none of
  // the frontend code offers any kind of verification of authentication, that
  // is purely the responsibility of the API.
  isLoggedIn: function() {
    return this.isUserInLocalStorage() && this.isSessionCookiePresent();
  },

  // Is this the first time we've checked if the user is logged in since
  // they actually logged in through an OAuth flow?
  isFirstCheckSinceSuccessfulOauth: function() {
    return !this.isUserInLocalStorage() && this.isSessionCookiePresent();
  },

  // The session gets set on the redirect after a successful OAuth flow.
  isSessionCookiePresent: function() {
    return !!cookie.read("oam-session");
  },

  isUserInLocalStorage: function() {
    return !!localStorage.getItem("oam-user");
  },

  logIn: function() {
    this.loadUser();
    this.trigger("user");
  },

  logOut: function() {
    cookie.erase("oam-session");
    localStorage.removeItem("oam-user");
    localStorage.removeItem("upload-form-fields");
    this.storage.user = null;
    this.trigger("user");
    hashHistory.push({ pathname: "/" });
    actions.showNotification("info", "You have been logged out.");
  }
});
