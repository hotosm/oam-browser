'use strict';
var React = require('react');
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
    <Route path="about" name="about" handler={About} />
  </Route>
);

module.exports = routes;