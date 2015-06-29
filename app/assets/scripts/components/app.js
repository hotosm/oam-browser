'use strict';
var React = require('react/addons');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var InfoModal = require('./modals/info_modal');
var WelcomeModal = require('./modals/welcome_modal');
var MessageModal = require('./modals/message_modal');
var Header = require('./header');

var App = React.createClass({
  render: function() {
    return (
      <div>
        <Header />
        <main id="site-body" role="main">
          <RouteHandler />
        </main>
        <WelcomeModal />
        <InfoModal />
        <MessageModal />
      </div>
    );
  }
});

module.exports = App;
