'use strict';
var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <header id="site-header">
          <h1>OpenAerialMap</h1>
        </header>
        <main id="site-body">
          <RouteHandler />
        </main>
      </div>
    );
  }
});