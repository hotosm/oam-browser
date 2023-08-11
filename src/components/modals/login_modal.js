import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Keys from "react-keybinding";

import FacebookBoxIcon from "mdi-react/FacebookBoxIcon";
import GoogleIcon from "mdi-react/GoogleIcon";

import logo from "images/oam-logo-h-pos.svg";
import Modal from "oam-design-system/modal";
import actions from "actions/actions";
import userStore from "stores/user_store";

var { ModalParent, ModalHeader, ModalBody } = Modal;

export default createReactClass({
  displayName: "LoginModal",

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
      revealed: false
    };
  },

  onOpenModal: function(which) {
    which === "login" && this.openModal();
  },

  closeModal: function() {
    this.setState({
      revealed: false
    });
  },

  openModal: function() {
    this.setState({ revealed: true });
  },

  render: function() {
    return (
      <ModalParent
        id="modal-login"
        className="modal--large"
        revealed={this.state.revealed}
      >
        <ModalHeader onCloseClick={this.closeModal}>
          <img src={logo} alt="OpenAerialMap logo" />
        </ModalHeader>
        <ModalBody>
          <p className="modal__subtitle">
            Sign in with your Google account.<br />
            <small>We will never post anything on your behalf.</small>
          </p>
          <div className="oauth-logins">
            {/* <a href={userStore.facebookLoginUri} className="facebook_login">
              <FacebookBoxIcon />
            </a> */}
            <a href={userStore.googleLoginUri} className="google_login">
              <GoogleIcon />
            </a>
          </div>
        </ModalBody>
      </ModalParent>
    );
  }
});
