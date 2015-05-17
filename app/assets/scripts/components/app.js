'use strict';
var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

module.exports = React.createClass({
  render: function() {
    return (
      <div className='site-body'>
        <h1>This it the app wrapper</h1>
        <RouteHandler />
      </div>
    );
  }
});