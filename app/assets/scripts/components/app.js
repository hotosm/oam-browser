'use strict';
import React from 'react';
import InfoModal from './modals/info_modal';
import WelcomeModal from './modals/welcome_modal';
import MessageModal from './modals/message_modal';
import Header from './header';
import actions from '../actions/actions';

var App = React.createClass({
  displayName: 'App',

  propTypes: {
    params: React.PropTypes.object,
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

  render: function () {
    // Only show the modal if there are no url params.
    // There can't be any other without map
    var params = this.props.params || {};
    var query = this.props.location.query || {};
    var showWelcomeModal = !params.map;

    return (
      <div>
        <Header params={params} query={query} />
        <main id='site-body' role='main'>
        {React.cloneElement(this.props.children, { params: params, query: query })}
        </main>
        <WelcomeModal revealed={showWelcomeModal} />
        <InfoModal />
        <MessageModal />
      </div>
    );
  }
});

module.exports = App;
