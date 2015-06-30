'use strict';
var React = require('react/addons');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var InfoModal = require('./modals/info_modal');
var WelcomeModal = require('./modals/welcome_modal');
var Header = require('./header');
var actions = require('../actions/actions');

var App = React.createClass({
  mixins: [ Router.State ],

  componentDidMount () {
    // Pull the search filter state from the URL.  Why is this here instead
    // of in the Filters component?  Because we want to ensure that we set
    // these filter parameters BEFORE the map component loads, since that is
    // where the map move action will get fired, triggering the first API load.
    //
    // TODO: this is really a stopgap until we integrate the router more
    // fully.  (See routes.js for more.)
    var params = this.getQuery();
    if (params.date) {
      actions.setDateFilter(params.date);
    }
    if (params.resolution) {
      actions.setResolutionFilter(params.resolution);
    }
  },

  render: function() {
    return (
      <div>
        <Header />
        <main id="site-body" role="main">
          <RouteHandler />
        </main>
        <WelcomeModal />
        <InfoModal />
      </div>
    );
  }
});

module.exports = App;
