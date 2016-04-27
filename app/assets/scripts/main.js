/* eslint react/no-deprecated: "off" */
// ^ Prevent lint error on "React.render". This is only a problem in react 0.14,
// but we're using react 0.13.

'use strict';
var React = require('react/addons');
var Router = require('react-router');
var routes = require('./routes');

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('site-canvas'));
});
