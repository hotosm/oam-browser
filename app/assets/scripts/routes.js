'use strict';
var React = require('react/addons');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var App = require('./components/app');
var Home = require('./components/home');

var routes = (
  <Route handler={App}>
    <Route name='map' path='/:map' handler={Home}>
      <Route name='results' path=':square' handler={Home}>
        <Route name='item' path=':item_id' handler={Home} />
      </Route>
    </Route>
    <DefaultRoute handler={Home} />
  </Route>
);

module.exports = routes;
