// This seems to only be used when connecting to JOSM when clicking
// on a single result item?

import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Keys from "react-keybinding";
import Modal from "oam-design-system/modal";

import actions from "actions/actions";

var { ModalParent, ModalHeader, ModalBody } = Modal;

export default createReactClass({
  displayName: "MessageModal",

  mixins: [Reflux.listenTo(actions.openModal, "onOpenModal"), Keys],

  keybindings: {
    esc: function() {
      this.closeModal();
    }
  },

  getInitialState: function() {
    return {
      title: "Message",
      message: "",
      revealed: false
    };
  },

  onOpenModal: function(which, data) {
    if (which === "message" && data) {
      this.setState(data);
      this.openModal();
    }
  },

  closeModal: function() {
    this.setState({ revealed: false });
  },

  openModal: function() {
    this.setState({ revealed: true });
  },

  render: function() {
    return (
      <ModalParent
        id="modal-message"
        className="modal--large"
        revealed={this.state.revealed}
      >
        <ModalHeader onCloseClick={this.closeModal}>
          <div className="modal__headline">
            <h1 className="modal__title">{this.state.title}</h1>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="message">{this.state.message}</div>
        </ModalBody>
      </ModalParent>
    );
  }
});
