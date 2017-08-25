import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import utils from "../utils/utils";

import $ from "jquery";
import config from "config";

const apiUrl = config.catalog.url;

export default createReactClass({
  displayName: "Account",

  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  mixins: [],

  getInitialState: function() {
    return {
      loading: true,
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

  // TODO:
  //   * Refactor into centralised API class
  //   * Paginate
  fetchUserData: function() {
    let userPath = "";
    this.setState({
      loading: true
    });
    if (this.requestedUser !== "current") {
      userPath = "/" + this.requestedUser;
    }
    $.get({
      url: apiUrl + "/user" + userPath,
      xhrFields: {
        withCredentials: true
      }
    }).done(response => {
      this.setState({
        user: response.results,
        loading: false
      });
    });
  },

  deleteImagery: function(id) {
    this.setState({
      loading: true
    });
    $.ajax({
      url: apiUrl + "/meta/" + id,
      method: "DELETE",
      xhrFields: {
        withCredentials: true
      }
    }).done(response => {
      this.fetchUserData();
    });
  },

  render: function() {
    return (
      <div>
        <div className="page__content">
          <h1>
            <img
              className="profile_pic"
              src={this.state.user.profile_pic_uri}
              width="100"
              alt="Profile"
            />
            {this.state.user.name}
          </h1>
          <ul className="account__images">
            {this.state.user.images.length > 0
              ? this.state.user.images.map((image, i) =>
                  <li className="account__images-upload">
                    <img
                      src={image.properties.thumbnail}
                      width="100"
                      key={i}
                      alt="Imagery thumbnail"
                    />
                    <ul>
                      <strong>
                        {image.title}
                      </strong>
                      <li>
                        Uploaded: {image.uploaded_at}
                      </li>
                      <li>
                        Sensor: {image.properties.sensor}
                      </li>
                      <li>
                        Resolution: {image.gsd}m
                      </li>
                      <li>
                        File size: {image.file_size / 1000}k
                      </li>
                      <li>
                        <a href={utils.imageUri(image)}>View</a>
                        {this.requestedUser === "current"
                          ? <span>
                              {" "}|&nbsp;
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
                          : null}
                      </li>
                    </ul>
                  </li>
                )
              : <em>No uploaded images yet.</em>}
          </ul>
        </div>
        {this.state.loading
          ? <p className="loading revealed">Loading</p>
          : null}
      </div>
    );
  }
});
