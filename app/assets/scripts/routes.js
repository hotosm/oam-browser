'use strict';
import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './components/app';
import Home from './components/home';
import Account from './components/account';
import UploaderForm from './components/uploader/home';
import UploaderStatus from './components/uploader/status';

import User from './utils/user';

var routes = (
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <Route
        name='account'
        path='/account'
        component={Account}
        onEnter={User.routeRequiresAuth.bind(User)}
      />
      <Route
        name='upload'
        path='/upload'
        component={UploaderForm}
        onEnter={User.routeRequiresAuth.bind(User)}
      >
        <Route name='upload-status' path='/upload/status/:id' component={UploaderStatus} />
      </Route>
      <Route name='map' path='/:map' component={Home}>
        <Route name='results' path=':square' component={Home}>
          <Route name='item' path=':item_id' component={Home} />
        </Route>
      </Route>
    </Route>
  </Router>
);

module.exports = routes;
