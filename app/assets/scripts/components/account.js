'use strict';
import React from 'react';
var $ = require('jquery');

var apiUrl = require('../config').catalog.url;
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
    return {
      images: []
    };
  },

  componentDidMount: function () {
    this.fetchUserData();
  },

  // TODO:
  //   * Refactor into centralised API class
  //   * Call to /meta not /user
  //   * Paginate
  fetchUserData: function () {
    $.get({
      url: apiUrl + '/user',
      xhrFields: {
        withCredentials: true
      }
    }).done((response) => {
      this.setState({images: response.results.images});
    });
  },

  deleteImagery: function (id) {
    $.ajax({
      url: apiUrl + '/meta/' + id,
      method: 'DELETE',
      xhrFields: {
        withCredentials: true
      }
    }).done((response) => {
      this.fetchUserData();
    });
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
          { this.state.images.length > 0
            ? this.state.images.map((image, i) =>
                <li className="account__images-upload">
                  <img src={image.properties.thumbnail} width="100" key={i} />
                  <ul>
                    <strong>{image.title}</strong>
                    <li>Uploaded: {image.uploaded_at}</li>
                    <li>Sensor: {image.properties.sensor}</li>
                    <li>Resolution: {image.gsd}m</li>
                    <li>File size: {image.file_size / 1000}k</li>
                    <li>
                      <a href={utils.imageUri(image)}>View</a> |&nbsp;
                      <a href={'/#/imagery/' + image._id + '/edit'}>Edit</a> |&nbsp;
                      <a onClick={() => this.deleteImagery(image._id)} className='imagery-delete'>Delete</a>
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
