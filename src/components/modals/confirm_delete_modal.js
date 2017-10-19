import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Keys from "react-keybinding";

import Modal from "oam-design-system/modal";

import actions from "actions/actions";

const { ModalParent, ModalHeader, ModalBody } = Modal;

export default createReactClass({
  displayName: "ConfirmDeleteModal",

  propTypes: {
    revealed: PropTypes.bool,
    deleteImage: PropTypes.func
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

  closeModal: function() {
    this.setState({
      revealed: false
    });
  },

  onOpenModal: function(which) {
    return which === "confirmdelete" && this.openModal();
  },

  openModal: function() {
    this.setState({ revealed: true });
  },

  render: function() {
    return (
      <ModalParent
        id="modal-about"
        className="modal--small"
        revealed={this.state.revealed}
      >
        <ModalHeader onCloseClick={this.closeModal}>
          <div className="modal__headline">
            <h1 className="modal__title">Confirm Delete</h1>
            <p className="modal__subtitle">
              Are you sure you want to delete this image?
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <button
            className="button button--base button--large"
            type="button"
            onClick={() => {
              this.props.deleteImage();
              this.closeModal();
            }}
          >
            <span>Delete</span>
          </button>
        </ModalBody>
      </ModalParent>
    );
  }
});
