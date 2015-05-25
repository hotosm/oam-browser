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
  <Route path="/" handler={App}>
    <DefaultRoute name="home" handler={Home} />
  </Route>
);

module.exports = routes;