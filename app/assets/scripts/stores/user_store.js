// TODO:
//   None of the state here is hooked into the React state/render lifecycle.
//   So turn this object into into a wrapped component decorator and connect it
//   to a store. See:
//     https://auth0.com/blog/adding-authentication-to-your-react-flux-app/
//     https://github.com/adambene/react-authenticate/blob/master/src/authenticate.js

import $ from '../deprecate/jquery';
import Reflux from 'reflux';

import config from '../config';
import cookie from '../utils/cookie';
import { hashHistory } from 'react-router';
import actions from '../actions/actions';

module.exports = Reflux.createStore({
  // This is a simple HTTP endpoint on the API that triggers the entire OAuth flow
  // and redirects back to the original login point with a set session cookie, if
  // everything went well.
  loginUri: config.catalog.url + '/login?original_uri=http://localhost:3000',

  storage: {
    // User's details, name, profile pic, etc.
    user: {}
  },

  init: function () {
    this.listenTo(actions.userLogIn, this.logIn);
    this.listenTo(actions.userLogOut, this.logOut);
    this.checkIfUserAlreadyLoggedIn();
  },

  checkIfUserAlreadyLoggedIn: function () {
    if (this.isLoggedIn()) {
      this.logIn();
    }
  },

  getUserDetails: function () {
    $.get({
      url: config.catalog.url + '/user',
      xhrFields: {
        withCredentials: true
      }
    }).done((response) => {
      this.saveUserLocally(response.results);
      this.logIn();
    });
  },

  saveUserLocally: function (details) {
    localStorage.setItem('oam-user', JSON.stringify(details));
  },

  loadUser: function () {
    this.storage.user = JSON.parse(localStorage.getItem('oam-user'));
  },

  // The concept of being fully logged in requires both the session cookie
  // and populated user details aquired from a subsequent authenticated API
  // request.
  isLoggedIn: function () {
    return this.isUserInLocalStorage() && this.isSessionCookiePresent();
  },

  // Is this the first time we've checked if the user is logged in since
  // they actually logged in?
  isFirstCheckSinceSuccessfulOauth: function () {
    return !this.isUserInLocalStorage() && this.isSessionCookiePresent();
  },

  // The session gets set on the redirect after a successful OAuth flow.
  isSessionCookiePresent: function () {
    return !!cookie.read('oam-session');
  },

  isUserInLocalStorage: function () {
    return !!localStorage.getItem('oam-user');
  },

  logIn: function () {
    this.loadUser();
    this.trigger('user');
  },

  logOut: function () {
    cookie.erase('oam-session');
    localStorage.removeItem('oam-user');
    this.storage.user = null;
    this.trigger('user');
    hashHistory.push({pathname: '/'});
    actions.showNotification('info', 'You have been logged out.');
  }
});
