'use strict';
import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './components/app';
import Home from './components/home';
import Account from './components/account';
import UploaderForm from './components/uploader/home';
import UploaderStatus from './components/uploader/status';

var AppActions = require('./actions/actions');
var cookie = require('./utils/cookie.js');

var User = {
  isLoggedIn: function () {
    return !!cookie.read('oam-session');
  }
};

function requireAuth (_nextState, replace) {
  if (!User.isLoggedIn()) {
    replace('/');
    AppActions.showNotification('alert', 'You must be logged in.');
  }
}

var routes = (
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <Route name='account' path='/account' component={Account} onEnter={requireAuth} />
      <Route name='upload' path='/upload' component={UploaderForm} />
      <Route name='upload-status' path='/upload/status/:id' component={UploaderStatus} />
      <Route name='map' path='/:map' component={Home}>
        <Route name='results' path=':square' component={Home}>
          <Route name='item' path=':item_id' component={Home} />
        </Route>
      </Route>
    </Route>
  </Router>
);

module.exports = routes;
