'use strict';
import React from 'react';

import userStore from '../stores/user_store';

module.exports = React.createClass({
  displayName: 'Account',

  propTypes: {
    params: React.PropTypes.object,
    query: React.PropTypes.object
  },

  mixins: [
  ],

  getInitialState: function () {
    return {};
  },

  componentWillMount: function () {
  },

  componentWillReceiveProps: function (nextProps) {
  },

  componentDidMount: function () {
  },

  render: function () {
    return (
      <div>
        <a href="#/">Home</a>
        <img
          className="profile_pic"
          src={userStore.storage.user.profile_pic_uri}
        />
        <ul>
          <li>{userStore.storage.user.name}</li>
          <li>{userStore.storage.user.contact_email}</li>
          <li>Total images: {userStore.storage.user.images.length}</li>
        </ul>
      </div>
    );
  }
});
