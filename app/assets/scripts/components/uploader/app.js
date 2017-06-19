'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var AppActions = require('../actions/actions');
var Notifications = require('./notifications');

module.exports = React.createClass({
  displayName: 'App',

  mixins: [
    Reflux.listenTo(AppActions.showNotification, 'onNotificationShow'),
    Reflux.listenTo(AppActions.clearNotification, 'dismissNotification'),
    Reflux.listenTo(AppActions.clearNotificationAfter, 'dismissNotification'),
    Router.State
  ],

  getInitialState: function () {
    return {
      notification: { type: null, message: null }
    };
  },

  onNotificationShow: function (type, message) {
    this.setState({
      notification: { type: type, message: message }
    });
  },

  dismissNotification: function (time) {
    if (!time) {
      time = 0;
    }

    setTimeout(function () {
      this.setState({
        notification: { type: null, message: null }
      });
    }.bind(this), time);
  },

  render: function () {
    return (
      <div>
        <div className='inner-wrapper'>
          <header className='site-header' role='banner'>
            <div className='inner'>
              <div className='site-headline'>
                <h1 className='site-title'>
                  <img
                    src='assets/graphics/layout/oam-logo-h-pos.svg'
                    width='167'
                    height='32'
                    alt='OpenAerialMap logo' />
                    <span>OpenAerialMap</span>
                    <small>Uploader</small>
                </h1>
              </div>
            </div>
          </header>
          <main className='site-body' role='main'>
            <div className='inner'>
              <RouteHandler/>
            </div>
          </main>
        </div>
        <Notifications
          type={this.state.notification.type}
          onNotificationDismiss={this.dismissNotification}>
          {this.state.notification.message}
        </Notifications>
      </div>
    );
  }
});
