import React from "react";
import createReactClass from "create-react-class";
import { hashHistory } from "react-router";

import userStore from "stores/user_store";
import api from "utils/api";
import AppActions from "actions/actions";

export default createReactClass({
  displayName: "UserEdit",

  onSubmit: function(e) {
    e.preventDefault();
    const formData = {
      name: document.querySelector("#name").value,
      website: document.querySelector("#website").value,
      bio: document.querySelector("#bio").value
    };
    api({
      uri: "/user",
      auth: true,
      method: "PUT",
      body: formData
    })
      .then(response => {
        userStore.getUserDetails();
        hashHistory.replace({ pathname: "/account" });
      })
      .catch(error => {
        AppActions.showNotification(
          "error",
          "There was a problem updating your profile. Please try again."
        );
      });
  },

  render: function() {
    return (
      <div className="imagery-editor form-wrapper">
        <section className="panel">
          <header className="panel-header">
            <div className="panel-headline">
              <h1 className="panel-title">Edit Your Profile</h1>
            </div>
          </header>
          <div className="panel-body">
            <form id="profile-form" className="form-horizontal">
              <label className="form__label none" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                name="name"
                id="name"
                defaultValue={userStore.storage.user.name}
              />
              <label className="form__label none" htmlFor="website">
                Website
              </label>
              <input
                type="text"
                placeholder="URL"
                name="website"
                id="website"
                defaultValue={userStore.storage.user.website}
              />
              <label className="form__label none" htmlFor="bio">
                Bio
              </label>
              <textarea
                placeholder="A short description of yourself of organization"
                name="bio"
                id="bio"
                defaultValue={userStore.storage.user.bio}
              />
              <div className="form-actions">
                <a
                  type="submit"
                  className="bttn bttn-lg bttn-block bttn-submit"
                  onClick={this.onSubmit}
                >
                  Submit
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }
});
