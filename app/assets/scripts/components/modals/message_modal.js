'use strict';
import React from 'react';
import Reflux from 'reflux';
import Keys from 'react-keybinding';
import actions from '../../actions/actions';
import OAM from 'oam-design-system';
var { Modal, ModalHeader, ModalBody } = OAM.Modal;

var MessageModal = React.createClass({
  displayName: 'MessageModal',

  mixins: [
    Reflux.listenTo(actions.openModal, 'onOpenModal'),
    Keys
  ],

  keybindings: {
    'esc': function () {
      this.closeModal();
    }
  },

  getInitialState: function () {
    return {
      title: 'Message',
      message: '',
      revealed: false
    };
  },

  onOpenModal: function (which, data) {
    if (which === 'message' && data) {
      this.setState(data);
      this.openModal();
    }
  },

  closeModal: function () {
    this.setState({ revealed: false });
  },

  openModal: function () {
    this.setState({ revealed: true });
  },

  render: function () {
    return (
      <Modal
        id='modal-message'
        className='modal--large'
        onCloseClick={this.closeModal}
        revealed={this.state.revealed} >

        <ModalHeader>
          <div className='modal__headline'>
            <h1 className='modal__title'>{this.state.title}</h1>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='message'>
            {this.state.message}
          </div>
        </ModalBody>
      </Modal>
    );
  }
});

module.exports = MessageModal;
