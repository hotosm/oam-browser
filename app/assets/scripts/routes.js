'use strict';
import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './components/app';
import Home from './components/home';

var routes = (
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <Route name='map' path='/:map' component={Home}>
        <Route name='results' path=':square' component={Home}>
          <Route name='item' path=':item_id' component={Home} />
        </Route>
      </Route>
    </Route>
  </Router>
);

module.exports = routes;
