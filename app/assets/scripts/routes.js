'use strict';
var React = require('react/addons');
var Router = require('react-router');
var NotFoundRoute = Router.NotFoundRoute;
var Navigation = Router.Navigation;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var Redirect = Router.Redirect;


var App = require('./components/app');
var About = require('./components/about');
var Home = require('./components/home');

var routes = (
  <Route handler={App}>
    <Route name="map" path="/:map" handler={Home}>
      <Route name="results" path=":square" handler={Home}>
        <Route name="item" path=":item_id" handler={Home} />
      </Route>
    </Route>
    <DefaultRoute handler={Home} />
  </Route>
);

module.exports = routes;