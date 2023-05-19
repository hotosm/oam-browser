import React from "react/addons";
import Reflux from "reflux";
import createReactClass from "create-react-class";
import Router from "react-router";
import AppActions from "actions/actions";
import Notifications from "components/uploader/notifications";

let RouteHandler = Router.RouteHandler;

export default createReactClass({
  displayName: "App",

  mixins: [
    Reflux.listenTo(AppActions.showNotification, "onNotificationShow"),
    Reflux.listenTo(AppActions.clearNotification, "dismissNotification"),
    Reflux.listenTo(AppActions.clearNotificationAfter, "dismissNotification"),
    Router.State
  ],

  getInitialState: function() {
    return {
      notification: { type: null, message: null }
    };
  },

  onNotificationShow: function(type, message) {
    if (typeof this.timer !== "undefined") {
      clearTimeout(this.timer);
    }

    this.setState({
      notification: { type: type, message: message }
    });
  },

  dismissNotification: function(time) {
    if (typeof time === "undefined") {
      this.setState({
        notification: { type: null, message: null }
      });
      return;
    }

    clearTimeout(this.timer);

    this.timer = setTimeout(
      function() {
        this.setState({
          notification: { type: null, message: null }
        });
      }.bind(this),
      time
    );
  },

  render: function() {
    return (
      <div>
        <div className="inner-wrapper">
          <header className="site-header" role="banner">
            <div className="inner">
              <div className="site-headline">
                <h1 className="site-title">
                  <img
                    src="assets/graphics/layout/oam-logo-h-pos.svg"
                    width="167"
                    height="32"
                    alt="OpenAerialMap logo"
                  />
                  <span>OpenAerialMap</span>
                  <small>Uploader</small>
                </h1>
              </div>
            </div>
          </header>
          <main className="site-body" role="main">
            <div className="inner">
              <RouteHandler />
            </div>
          </main>
        </div>
        <Notifications
          type={this.state.notification.type}
          onNotificationDismiss={this.dismissNotification}
        >
          {this.state.notification.message}
        </Notifications>
      </div>
    );
  }
});
