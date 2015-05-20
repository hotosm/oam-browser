'use strict';
var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  render: function() {
    return (
      <div>
        <header id="site-header">
          <h1 id="site-title"><img src="/assets/graphics/layout/oam-logo-h-pos.svg" width="167" height="32" alt="OpenAerialMap logo" /><span>OpenAerialMap</span></h1>
        </header>
        <main id="site-body">
          <RouteHandler />
        </main>
      </div>
    );
  }
});

module.exports = App;