'use strict';
import React from 'react';
import Reflux from 'reflux';
import BModal from './base_modal';
import actions from '../../actions/actions';

var MessageModal = React.createClass({
  displayName: 'MessageModal',

  mixins: [
    Reflux.listenTo(actions.openModal, 'onOpenModal')
  ],

  getInitialState: function () {
    return {
      title: 'Message',
      message: ''
    };
  },

  onOpenModal: function (which, data) {
    if (which === 'message' && data) {
      this.setState(data);
    }
  },

  getHeader: function () {
    return (<h1 className='modal-title'>{this.state.title}</h1>);
  },

  getBody: function () {
    return (
      <div className='message'>
        {this.state.message}
      </div>
    );
  },

  getFooter: function () {
    return false;
  },

  render: function () {
    return (
      <BModal
        type='message'
        header={this.getHeader()}
        body={this.getBody()}
        footer={this.getFooter()}
        revealed={false} />
    );
  }
});

module.exports = MessageModal;
