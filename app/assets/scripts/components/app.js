'use strict';
import React from 'react';
import Reflux from 'reflux';

import MessageModal from './modals/message_modal';
import Notifications from '../components/uploader/notifications';
import FeedbackModal from './modals/feedback_modal';
import Header from './header';
import actions from '../actions/actions';

var App = React.createClass({
  displayName: 'App',

  mixins: [
    Reflux.listenTo(actions.showNotification, 'onNotificationShow'),
    Reflux.listenTo(actions.clearNotification, 'dismissNotification'),
    Reflux.listenTo(actions.clearNotificationAfter, 'dismissNotification')
  ],

  propTypes: {
    params: React.PropTypes.object,
    routes: React.PropTypes.array,
    location: React.PropTypes.object,
    children: React.PropTypes.object
  },

  componentWillMount: function () {
    // Pull the search filter state from the URL.  Why is this here instead
    // of in the Filters component?  Because we want to ensure that we set
    // these filter parameters BEFORE the map component loads, since that is
    // where the map move action will get fired, triggering the first API load.
    //
    // TODO: this should be reviewed at some point.
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
    // Only show the modal if there are no url params.
    // There can't be any other without map.
    var params = this.props.params || {};
    var query = this.props.location.query || {};

    // If we're on a specific coordinate location.
    const isLocation = this.props.routes[this.props.routes.length - 1].name === 'map';
    // If we're on the homepage.
    const isHome = this.props.location.pathname === '/';

    // Is this the main map view?
    const isMap = isLocation || isHome;

    return (
      <div>

        { isMap
          ? <Header params={params} query={query} />
          : null
        }

        <main className='page__body' role='main'>
          <section className='layout layout--app'>
            <header className='layout__header'>
              <div className='inner'>
                <div className='layout__headline'>
                  <h1 className='layout__title'>Browse</h1>
                </div>
              </div>
            </header>
            <div className='layout__body'>
              <div className='inner'>
                {React.cloneElement(this.props.children, {
                  params: params,
                  query: query
                })}
              </div>
            </div>
          </section>
        </main>
        <footer className='page__footer' role='contentinfo'>
          <div className='inner'>
            <p>
              Made with love by
              {' '}
              <a
                href='https://developmentseed.org'
                title='Visit Development Seed website'
              >
                Development Seed
              </a>
              {' '}
              and
              {' '}
              <a
                href='http://hot.openstreetmap.org/'
                title='Visit the Humanitarian OpenStreetMap Team website'
              >
                HOT
              </a>
              .
            </p>
          </div>
        </footer>
        <MessageModal />
        <Notifications
          type={this.state.notification.type}
          onNotificationDismiss={this.dismissNotification}
        >
          {this.state.notification.message}
        </Notifications>
        <FeedbackModal />
      </div>
    );
  }
});

module.exports = App;
