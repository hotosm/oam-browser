import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Keys from "react-keybinding";

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
        onCloseClick={this.closeModal}
        revealed={this.state.revealed}
      >
        <ModalHeader>
          <div className="modal__headline">
            <h1 className="modal__title">Sign In</h1>
            <p className="modal__subtitle">
              Login with your Facebook or Google identities. We will never post
              anything on your behalf.
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="oauth-logins">
            <a href={userStore.facebookLoginUri}>Facebook</a> |&nbsp;
            <a href={userStore.googleLoginUri}>Google</a>
          </div>
        </ModalBody>
      </ModalParent>
    );
  }
});
