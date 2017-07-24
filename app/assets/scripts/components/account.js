'use strict';
import React from 'react';

import userStore from '../stores/user_store';
import utils from '../utils/utils';

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
      <div className="page__content">
        <h1>
          <img
            className="profile_pic"
            src={userStore.storage.user.profile_pic_uri}
            width="100"
          />
          {userStore.storage.user.name}
        </h1>
        <ul className="account__images">
          { userStore.storage.user.images.length > 0
            ? userStore.storage.user.images.map((image, i) =>
                <li className="account__images-upload">
                  <img src={image.properties.thumbnail} width="100" key={i} />
                  <ul>
                    <strong>{image.title}</strong>
                    <li>Uploaded: {image.uploaded_at}</li>
                    <li>Sensor: {image.properties.sensor}</li>
                    <li>Resolution: {image.gsd}m</li>
                    <li>File size: {image.file_size / 1000}k</li>
                    <li>
                      <a href={utils.imageUri(image)}>View</a> |
                      Edit |
                      Delete
                    </li>
                  </ul>
                </li>
              )
            : <em>You haven't uploaded any images yet.</em>
          }
        </ul>
      </div>
    );
  }
});
