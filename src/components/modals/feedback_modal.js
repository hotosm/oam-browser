import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Keys from "react-keybinding";
import serialize from "form-serialize";
import config from "config";

import _ from "lodash";
import Modal from "oam-design-system/modal";

import actions from "actions/actions";

var { ModalParent, ModalHeader, ModalBody } = Modal;

export default createReactClass({
  displayName: "FeedbackModal",

  propTypes: {
    revealed: PropTypes.bool
  },

  mixins: [Reflux.listenTo(actions.openModal, "onOpenModal"), Keys],

  keybindings: {
    esc: function() {
      this.closeModal();
    }
  },

  getInitialState: function() {
    return {
      revealed: false,
      response: null,
      errors: {
        name: "",
        email: "",
        subject: "",
        message: ""
      },
      lockSubmit: false
    };
  },

  onOpenModal: function(which) {
    return which === "feedback" && this.openModal();
  },

  closeModal: function() {
    this.setState({
      revealed: false,
      response: null,
      errors: {
        name: "",
        email: "",
        subject: "",
        message: ""
      }
    });
  },

  openModal: function() {
    this.setState({ revealed: true });
  },

  onSubmit: function(e) {
    e.preventDefault();

    var form = this.refs.feedbackForm;
    var serial = serialize(form, { hash: true });
    var ok = true;
    var errors = {
      name: "",
      email: "",
      subject: "",
      message: ""
    };

    if (!serial.name || _.trim(serial.name) === "") {
      ok = false;
      errors.name = "Please provide a valid name.";
    }
    if (serial.email && serial.email.indexOf("@") === -1) {
      ok = false;
      errors.email = "Please provide a valid email.";
    }

    if (!serial.subject || serial.subject === "--") {
      ok = false;
      errors.subject = "Please select a subject.";
    }

    if (!serial.message || _.trim(serial.message) === "") {
      ok = false;
      errors.message = "Please provide some feedback.";
    }

    this.setState({ errors });

    if (ok) {
      serial.path = window.location.href;
      console.log("serial", serial);
      this.setState({
        lockSubmit: true,
        response: null
      });

      fetch(config.feedbackSubmissionURL)
        .then(response => response.text())
        .then(responseText => {
          const match = responseText.match(/\?\((.*)\);/);
          if (!match) throw new Error("invalid JSONP response");
          this.setState({
            response: "Your feedback has been submitted. Thank you.",
            lockSubmit: false
          });
          form.reset();
        })
        .catch(error => {
          this.setState({
            response:
              "There was a problem during submission. Please try again.",
            lockSubmit: false
          });
          this.setState({ lockSubmit: false });
        });
    }
  },

  render: function() {
    return (
      <ModalParent
        id="modal-about"
        className="modal--large"
        revealed={this.state.revealed}
      >
        <ModalHeader onCloseClick={this.closeModal}>
          <div className="modal__headline">
            <h1 className="modal__title">Feedback</h1>
            <p className="modal__subtitle">
              Your feedback helps us build a better system
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <form className="form-horizontal" ref="feedbackForm">
            <div className="form__group">
              <label htmlFor="name" className="form__label">
                Name
              </label>
              <div className="form-control-set">
                <input
                  id="name"
                  name="name"
                  className="form__control form__control--medium"
                  type="text"
                  placeholder="Bruce Wayne"
                />
                {this.state.errors.name ? (
                  <p className="message message--alert">
                    {this.state.errors.name}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="email" className="form__label">
                Email
              </label>
              <div className="form-control-set">
                <input
                  id="email"
                  name="email"
                  className="form__control form__control--medium input"
                  type="email"
                  placeholder="bruce@wayne.co"
                />
                <p className="form__help">
                  Email is optional, but provide one if you want followup.
                </p>
                {this.state.errors.email ? (
                  <p className="message message--alert">
                    {this.state.errors.email}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="email" className="form__label">
                Subject
              </label>
              <div className="form-control-set">
                <select
                  name="subject"
                  id="subject"
                  className="form__control form__control--medium"
                >
                  <option value="--">Subject</option>
                  <option value="report">Report a technical issue</option>
                  <option value="opinion">Let us know what you think</option>
                  <option value="contact">Get in touch with OAM team</option>
                  <option value="other">Everything else</option>
                </select>
                {this.state.errors.subject ? (
                  <p className="message message--alert">
                    {this.state.errors.subject}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="message" className="form__label">
                Feedback
              </label>
              <div className="form-control-set">
                <textarea
                  name="message"
                  id="message"
                  rows="5"
                  className="form__control"
                  placeholder="Leave a message"
                />
                {this.state.errors.message ? (
                  <p className="message message--alert">
                    {this.state.errors.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="form__note">
              <p>
                When submitting the form, your current url and other necessary
                information will be collected.
              </p>
            </div>
            <div className="form__actions">
              <button
                className={
                  "button button--base button--large" +
                  (this.state.lockSubmit ? " disabled" : "")
                }
                type="submit"
                onClick={this.onSubmit}
              >
                <span>Submit</span>
              </button>
              {this.state.response ? (
                <span className="message form__response">
                  {this.state.response}
                </span>
              ) : null}
            </div>
          </form>
        </ModalBody>
      </ModalParent>
    );
  }
});
