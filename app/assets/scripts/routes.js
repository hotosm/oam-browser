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

// Brief explanation on how the router works:
// The routing system was not built in from the beginning so adding one 
// at this point would require quite a substantial refactor.
// A lighter and easier solution was adopted instead.
// The app still works by retaining the information in memory (i.e. storing the
// item the user clicked instead of getting it from the id in the url), but
// everytime there's a change the path gets replaces with the correct values.
// Replacing the path means that there's no history, so no going back.
// The url is shareable and the system will check for values in the url on load.
// It will only work on the first load. If a value is manually changed in the
// url, a simple "enter" won't make a difference. A hard refresh is necessary.

// Bottom line is that the router works in reverse. Instead of updating the page
// with info from it, it gets updated with info from the actions on the page.

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