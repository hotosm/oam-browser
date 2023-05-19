import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";

import Notifications from "components/uploader/notifications";
import MessageModal from "components/modals/message_modal";
import FeedbackModal from "components/modals/feedback_modal";
import LoginModal from "components/modals/login_modal";
import Header from "components/header";
import User from "utils/user";
import actions from "actions/actions";

export default createReactClass({
  displayName: "App",

  mixins: [
    Reflux.listenTo(actions.showNotification, "onNotificationShow"),
    Reflux.listenTo(actions.clearNotification, "dismissNotification"),
    Reflux.listenTo(actions.clearNotificationAfter, "dismissNotification")
  ],

  propTypes: {
    params: PropTypes.object,
    routes: PropTypes.array,
    location: PropTypes.object,
    children: PropTypes.object
  },

  componentWillMount: function() {
    User.setup();
    this.setupFilters();
  },

  componentWillUnmount: function() {
    if (typeof this.timer !== "undefined") {
      clearTimeout(this.timer);
    }
  },

  getInitialState: function() {
    return {
      notification: { type: null, message: null }
    };
  },

  // Pull the search filter state from the URL.  Why is this here instead
  // of in the Filters component?  Because we want to ensure that we set
  // these filter parameters BEFORE the map component loads, since that is
  // where the map move action will get fired, triggering the first API load.
  //
  // TODO: this should be reviewed at some point.
  setupFilters: function() {
    var query = this.props.location.query || {};
    if (query.date) {
      actions.setDateFilter(query.date);
    }
    if (query.resolution) {
      actions.setResolutionFilter(query.resolution);
    }
    if (query.type) {
      actions.setDataTypeFilter(query.type);
    }
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
    // Only show the modal if there are no url params.
    // There can't be any other without map.
    var params = this.props.params || {};
    var query = this.props.location.query || {};

    return (
      <div>
        <Header
          params={params}
          query={query}
          routes={this.props.routes}
          location={this.props.location}
        />

        <main className="page__body" role="main">
          <section className="layout layout--app">
            <div className="layout__body">
              {React.cloneElement(this.props.children, {
                params: params,
                query: query
              })}
            </div>
          </section>
        </main>
        <Notifications
          type={this.state.notification.type}
          onNotificationDismiss={this.dismissNotification}
        >
          {this.state.notification.message}
        </Notifications>
        <MessageModal />
        <FeedbackModal />
        <LoginModal />
      </div>
    );
  }
});
