import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";

import ChevronRightIcon from "mdi-react/ChevronRightIcon";

import utils from "utils/utils";
import api from "utils/api";

export default createReactClass({
  displayName: "Account",

  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  mixins: [],

  getInitialState: function() {
    return {
      user: {
        images: []
      }
    };
  },

  componentWillMount: function() {
    this.loadUser(this.props);
  },

  componentWillReceiveProps: function(newProps) {
    this.loadUser(newProps);
  },

  loadUser: function(props) {
    if (props.params.id) {
      this.requestedUser = props.params.id;
    } else {
      this.requestedUser = "current";
    }
    this.fetchUserData();
  },

  // TODO: Paginate.
  fetchUserData: function() {
    let userPath = "";
    if (this.requestedUser !== "current") {
      userPath = "/" + this.requestedUser;
    }
    api({
      uri: "/user" + userPath,
      auth: true
    }).then(response => {
      this.setState({
        user: response.results
      });
    });
  },

  deleteImagery: function(id) {
    api({
      uri: "/meta/" + id,
      method: "DELETE",
      auth: true
    }).then(response => {
      this.fetchUserData();
    });
  },

  yourImages: function() {
    return (
      <div className="your-images">
        <h2>Your Images</h2>
        <ul className="account__images">
          {this.state.user.images.length > 0 ? (
            this.state.user.images.map((image, i) => (
              <li className="account__images-upload">
                <div className="images-thumbnail">
                  <a onClick={() => utils.imageUri(image)}>
                    <img
                      src={image.properties.thumbnail}
                      width="100"
                      key={i}
                      alt="Imagery thumbnail"
                    />
                  </a>
                </div>
                <div className="images-body">
                  <ul>
                    <strong>{image.title}</strong>
                    <li>Uploaded: {image.uploaded_at}</li>
                    <li>Sensor: {image.properties.sensor}</li>
                    <li>Resolution: {image.gsd}m</li>
                    <li>File size: {image.file_size / 1000}k</li>
                    <li>
                      {this.requestedUser === "current" ? (
                        <span>
                          <a href={"/#/imagery/" + image._id + "/edit"}>
                            Edit
                          </a>{" "}
                          |&nbsp;
                          <a
                            onClick={() => this.deleteImagery(image._id)}
                            className="imagery-delete"
                          >
                            Delete
                          </a>
                        </span>
                      ) : null}
                    </li>
                  </ul>
                </div>
              </li>
            ))
          ) : (
            <em>No uploaded images yet.</em>
          )}
        </ul>
      </div>
    );
  },

  yourProfile: function() {
    let user = this.state.user;
    return (
      <div className="your-profile">
        <h2>Your Profile</h2>
        <div className="your-profile__content">
          <div className="your-profile__body">
            <img src={user.profile_pic_uri} width="75" alt="Your profile" />
            <ul>
              <li>
                <strong>{user.name}</strong>
              </li>
              <li>{user.contact_email}</li>
              <li>
                <a href={user.website}>{user.website}</a>
              </li>
              <li>{user.bio}</li>
            </ul>
          </div>
          <div style={{ clear: "both" }} />
          <a href={`#/0/user/${user._id}`} className="view-your-profile">
            View your profile
            <ChevronRightIcon />
          </a>
          <div style={{ clear: "both" }} />
          <a href={`#/account/edit`} className="edit-your-profile">
            Edit your profile
            <ChevronRightIcon />
          </a>
        </div>
      </div>
    );
  },

  render: function() {
    return (
      <div className="page__content account-page">
        {this.yourImages()}
        {this.yourProfile()}
      </div>
    );
  }
});
